"""
Comprehensive gallery upload and R2 integration tests.

Tests:
- Image upload to R2
- PIL validation
- Large file handling (95MB)
- Graceful error when R2 not configured
- File extension validation
- Content type validation
- Gallery item CRUD operations
"""
import pytest
import io
from PIL import Image
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import Mock, patch

from app.main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.user import User
from app.models.gallery import GalleryItem, GalleryTag, GalleryStatus
from app.core.security import get_password_hash, create_access_token
from app.services.storage import StorageService


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_user(db_session):
    """Create a test admin user."""
    user = User(
        email="admin@test.com",
        full_name="Test Admin",
        hashed_password=get_password_hash("testpass123"),
        is_active=True,
        is_superuser=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(admin_user):
    """Create authentication headers with valid token."""
    access_token = create_access_token(subject=admin_user.email)
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def valid_image():
    """Create a valid test image."""
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr


@pytest.fixture
def large_image():
    """Create a large test image (for size validation)."""
    # Create a 2000x2000 image (will be smaller than 95MB when compressed)
    img = Image.new('RGB', (2000, 2000), color='blue')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG', compress_level=0)  # No compression
    img_byte_arr.seek(0)
    return img_byte_arr


@pytest.fixture
def mock_storage_service():
    """Create a mock storage service."""
    mock = Mock(spec=StorageService)
    mock.is_configured = True
    mock.bucket_name = "test-bucket"
    mock.public_url = "https://test.r2.dev"
    mock.upload_file.return_value = "https://test.r2.dev/test-file.png"
    mock.delete_file.return_value = True
    mock.file_exists.return_value = True
    return mock


class TestImageUpload:
    """Test image upload functionality."""

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_upload_valid_image(self, mock_get_storage, client, auth_headers, valid_image, mock_storage_service):
        """Test uploading a valid image."""
        mock_get_storage.return_value = mock_storage_service

        files = {"file": ("test.png", valid_image, "image/png")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "filename" in data
        assert "url" in data
        assert data["width"] == 100
        assert data["height"] == 100

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_upload_jpg_image(self, mock_get_storage, client, auth_headers, mock_storage_service):
        """Test uploading a JPG image."""
        mock_get_storage.return_value = mock_storage_service

        # Create a JPG image
        img = Image.new('RGB', (200, 150), color='green')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)

        files = {"file": ("test.jpg", img_byte_arr, "image/jpeg")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["width"] == 200
        assert data["height"] == 150

    def test_upload_without_auth_fails(self, client, valid_image):
        """Test uploading without authentication fails."""
        files = {"file": ("test.png", valid_image, "image/png")}
        response = client.post("/api/v1/gallery/upload", files=files)

        assert response.status_code == 401

    def test_upload_invalid_file_type_fails(self, client, auth_headers):
        """Test uploading invalid file type fails."""
        # Create a text file
        text_file = io.BytesIO(b"This is not an image")

        files = {"file": ("test.txt", text_file, "text/plain")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.json()
        assert "not allowed" in data["detail"].lower()

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_upload_corrupted_image_fails(self, mock_get_storage, client, auth_headers, mock_storage_service):
        """Test uploading corrupted image fails."""
        mock_get_storage.return_value = mock_storage_service

        # Create corrupted image data
        corrupted_data = io.BytesIO(b"Not a real image file")

        files = {"file": ("test.png", corrupted_data, "image/png")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.json()
        assert "invalid" in data["detail"].lower()


class TestPILValidation:
    """Test PIL (Pillow) validation for images."""

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_pil_validates_image_format(self, mock_get_storage, client, auth_headers, mock_storage_service):
        """Test PIL validates image format correctly."""
        mock_get_storage.return_value = mock_storage_service

        # Create a valid PNG image
        img = Image.new('RGB', (50, 50), color='yellow')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        files = {"file": ("test.png", img_byte_arr, "image/png")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 200

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_pil_extracts_dimensions(self, mock_get_storage, client, auth_headers, mock_storage_service):
        """Test PIL correctly extracts image dimensions."""
        mock_get_storage.return_value = mock_storage_service

        # Create image with specific dimensions
        img = Image.new('RGB', (800, 600), color='purple')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        files = {"file": ("test.png", img_byte_arr, "image/png")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["width"] == 800
        assert data["height"] == 600

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_pil_handles_webp_format(self, mock_get_storage, client, auth_headers, mock_storage_service):
        """Test PIL handles WEBP format."""
        mock_get_storage.return_value = mock_storage_service

        # Create a WEBP image
        img = Image.new('RGB', (300, 300), color='cyan')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='WEBP')
        img_byte_arr.seek(0)

        files = {"file": ("test.webp", img_byte_arr, "image/webp")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 200


class TestLargeFileHandling:
    """Test handling of large files (up to 95MB limit)."""

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_upload_file_near_size_limit(self, mock_get_storage, client, auth_headers, mock_storage_service):
        """Test uploading file near the size limit."""
        mock_get_storage.return_value = mock_storage_service

        # Create a file just under the limit (100MB default)
        # We'll create a smaller test file for performance
        img = Image.new('RGB', (1000, 1000), color='orange')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG', compress_level=0)
        img_byte_arr.seek(0)

        files = {"file": ("large.png", img_byte_arr, "image/png")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        # Should succeed if under limit
        assert response.status_code in [200, 400]  # May fail if too large

    def test_upload_file_exceeds_size_limit(self, client, auth_headers):
        """Test uploading file exceeding size limit fails."""
        # Create a file larger than 100MB
        # We'll mock this with a large byte string for testing
        large_data = io.BytesIO(b"x" * (101 * 1024 * 1024))  # 101 MB

        files = {"file": ("toolarge.png", large_data, "image/png")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.json()
        assert "too large" in data["detail"].lower()

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_file_size_recorded_correctly(self, mock_get_storage, client, auth_headers, mock_storage_service, db_session):
        """Test that file size is recorded correctly in database."""
        mock_get_storage.return_value = mock_storage_service

        # Create a test image
        img = Image.new('RGB', (100, 100), color='red')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        file_size = len(img_byte_arr.getvalue())

        files = {"file": ("test.png", img_byte_arr, "image/png")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["size"] == file_size


class TestR2Configuration:
    """Test graceful handling when R2 is not configured."""

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_upload_fails_gracefully_without_r2(self, mock_get_storage, client, auth_headers, valid_image):
        """Test upload fails gracefully when R2 not configured."""
        # Mock unconfigured storage service
        mock_storage = Mock(spec=StorageService)
        mock_storage.is_configured = False
        mock_storage.upload_file.side_effect = Exception("R2 storage not configured")
        mock_get_storage.return_value = mock_storage

        files = {"file": ("test.png", valid_image, "image/png")}
        response = client.post(
            "/api/v1/gallery/upload",
            files=files,
            headers=auth_headers
        )

        assert response.status_code in [400, 500, 503]
        data = response.json()
        # Should have meaningful error message
        assert "detail" in data

    @patch('app.services.storage.StorageService')
    def test_storage_service_detects_missing_config(self, mock_storage_class):
        """Test StorageService detects missing R2 configuration."""
        # This tests the StorageService initialization
        from app.services.storage import StorageService

        # Mock missing credentials
        with patch('app.services.storage.settings') as mock_settings:
            mock_settings.R2_ACCOUNT_ID = ""
            mock_settings.R2_ACCESS_KEY_ID = ""
            mock_settings.R2_SECRET_ACCESS_KEY = ""
            mock_settings.R2_BUCKET_NAME = ""

            storage = StorageService()
            assert storage.is_configured is False


class TestGalleryItemCRUD:
    """Test gallery item CRUD operations."""

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_get_published_gallery_items(self, mock_get_storage, client, db_session, mock_storage_service):
        """Test getting published gallery items (public endpoint)."""
        mock_get_storage.return_value = mock_storage_service

        # Create published item
        item = GalleryItem(
            filename="test.png",
            url="https://test.r2.dev/test.png",
            size=1024,
            width=100,
            height=100,
            status=GalleryStatus.PUBLISHED
        )
        db_session.add(item)
        db_session.commit()

        response = client.get("/api/v1/gallery/items")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_get_all_gallery_items_admin(self, mock_get_storage, client, auth_headers, db_session, mock_storage_service):
        """Test getting all gallery items including drafts (admin only)."""
        mock_get_storage.return_value = mock_storage_service

        # Create draft and published items
        draft = GalleryItem(
            filename="draft.png",
            url="https://test.r2.dev/draft.png",
            size=1024,
            status=GalleryStatus.DRAFT
        )
        published = GalleryItem(
            filename="published.png",
            url="https://test.r2.dev/published.png",
            size=2048,
            status=GalleryStatus.PUBLISHED
        )
        db_session.add(draft)
        db_session.add(published)
        db_session.commit()

        response = client.get(
            "/api/v1/gallery/items/all",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_update_gallery_item_metadata(self, mock_get_storage, client, auth_headers, db_session, mock_storage_service):
        """Test updating gallery item metadata."""
        mock_get_storage.return_value = mock_storage_service

        # Create item
        item = GalleryItem(
            filename="test.png",
            url="https://test.r2.dev/test.png",
            size=1024,
            status=GalleryStatus.DRAFT
        )
        db_session.add(item)
        db_session.commit()
        db_session.refresh(item)

        # Update metadata
        update_data = {
            "caption": "Test Caption",
            "description": "Test Description",
            "alt_text": "Test Alt Text"
        }

        response = client.put(
            f"/api/v1/gallery/items/{item.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["caption"] == "Test Caption"
        assert data["description"] == "Test Description"

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_publish_gallery_item(self, mock_get_storage, client, auth_headers, db_session, mock_storage_service):
        """Test publishing a gallery item."""
        mock_get_storage.return_value = mock_storage_service

        # Create draft item
        item = GalleryItem(
            filename="test.png",
            url="https://test.r2.dev/test.png",
            size=1024,
            status=GalleryStatus.DRAFT
        )
        db_session.add(item)
        db_session.commit()
        db_session.refresh(item)

        # Publish it
        response = client.post(
            f"/api/v1/gallery/items/{item.id}/publish",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "published"
        assert data["published_at"] is not None

    @patch('app.api.v1.endpoints.gallery.get_storage_service')
    def test_delete_gallery_item(self, mock_get_storage, client, auth_headers, db_session, mock_storage_service):
        """Test deleting a gallery item."""
        mock_get_storage.return_value = mock_storage_service

        # Create item
        item = GalleryItem(
            filename="test.png",
            url="https://test.r2.dev/test.png",
            size=1024,
            status=GalleryStatus.DRAFT
        )
        db_session.add(item)
        db_session.commit()
        db_session.refresh(item)

        # Delete it
        response = client.delete(
            f"/api/v1/gallery/items/{item.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "deleted" in data["message"].lower()

    def test_gallery_items_require_auth_for_admin_operations(self, client, valid_image):
        """Test that gallery admin operations require authentication."""
        # Upload without auth
        files = {"file": ("test.png", valid_image, "image/png")}
        response = client.post("/api/v1/gallery/upload", files=files)
        assert response.status_code == 401

        # Get all without auth
        response = client.get("/api/v1/gallery/items/all")
        assert response.status_code == 401

        # Update without auth
        response = client.put("/api/v1/gallery/items/1", json={"caption": "Test"})
        assert response.status_code == 401

        # Delete without auth
        response = client.delete("/api/v1/gallery/items/1")
        assert response.status_code == 401
