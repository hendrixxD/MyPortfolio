"""
Comprehensive Article CRUD tests for admin dashboard.

Tests:
- Create article (draft)
- Publish article
- Update article
- Delete article
- Tag associations
- Slug uniqueness
- Pagination
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.user import User
from app.models.article import Article, ArticleStatus
from app.models.tag import Tag
from app.core.security import get_password_hash, create_access_token


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


@pytest.fixture(scope="function")
def sample_tags(db_session):
    """Create sample tags for testing."""
    tags = [
        Tag(name="Python", slug="python", color="#3776ab"),
        Tag(name="JavaScript", slug="javascript", color="#f7df1e"),
        Tag(name="Data Science", slug="data-science", color="#ff6b6b"),
    ]
    for tag in tags:
        db_session.add(tag)
    db_session.commit()
    for tag in tags:
        db_session.refresh(tag)
    return tags


@pytest.fixture(scope="function")
def sample_article(db_session, sample_tags):
    """Create a sample published article."""
    article = Article(
        title="Test Article",
        slug="test-article",
        summary="Test summary",
        content_md="# Test Content\n\nThis is test content.",
        status=ArticleStatus.PUBLISHED.value,
        featured=False,
        reading_time=5,
        tags=[sample_tags[0]]
    )
    db_session.add(article)
    db_session.commit()
    db_session.refresh(article)
    return article


class TestArticleCreation:
    """Test article creation functionality."""

    def test_create_article_draft(self, client, auth_headers, sample_tags):
        """Test creating a new article as draft."""
        article_data = {
            "title": "New Test Article",
            "slug": "new-test-article",
            "summary": "A test article summary",
            "content_md": "# Hello World\n\nThis is a test article.",
            "status": "draft",
            "reading_time": 3,
            "featured": False,
            "tag_ids": [sample_tags[0].id]
        }

        response = client.post(
            "/api/v1/articles/",
            json=article_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == article_data["title"]
        assert data["slug"] == article_data["slug"]
        assert data["status"] == "draft"
        assert len(data["tags"]) == 1
        assert data["tags"][0]["slug"] == "python"

    def test_create_article_without_auth_fails(self, client, sample_tags):
        """Test that creating article without authentication fails."""
        article_data = {
            "title": "Unauthorized Article",
            "slug": "unauthorized-article",
            "content_md": "This should fail",
            "status": "draft"
        }

        response = client.post("/api/v1/articles/", json=article_data)
        assert response.status_code == 401

    def test_create_article_with_duplicate_slug_fails(self, client, auth_headers, sample_article):
        """Test that creating article with duplicate slug fails."""
        article_data = {
            "title": "Duplicate Slug Article",
            "slug": sample_article.slug,  # Use existing slug
            "content_md": "This should fail",
            "status": "draft"
        }

        response = client.post(
            "/api/v1/articles/",
            json=article_data,
            headers=auth_headers
        )

        # Should fail due to unique constraint
        assert response.status_code in [400, 500]  # May vary based on error handling

    def test_create_article_with_multiple_tags(self, client, auth_headers, sample_tags):
        """Test creating article with multiple tags."""
        article_data = {
            "title": "Multi-Tag Article",
            "slug": "multi-tag-article",
            "content_md": "Article with multiple tags",
            "status": "draft",
            "tag_ids": [tag.id for tag in sample_tags]
        }

        response = client.post(
            "/api/v1/articles/",
            json=article_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert len(data["tags"]) == 3

    def test_create_article_with_minimal_fields(self, client, auth_headers):
        """Test creating article with only required fields."""
        article_data = {
            "title": "Minimal Article",
            "slug": "minimal-article",
            "content_md": "Minimal content"
        }

        response = client.post(
            "/api/v1/articles/",
            json=article_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Article"
        assert data["status"] == "draft"  # Default status


class TestArticlePublishing:
    """Test article publishing functionality."""

    def test_publish_draft_article(self, client, auth_headers, db_session):
        """Test publishing a draft article."""
        # Create draft article
        draft = Article(
            title="Draft Article",
            slug="draft-article",
            content_md="Draft content",
            status=ArticleStatus.DRAFT.value
        )
        db_session.add(draft)
        db_session.commit()
        db_session.refresh(draft)

        # Publish it
        response = client.post(
            f"/api/v1/articles/{draft.id}/publish",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "published"
        assert data["published_at"] is not None

    def test_unpublish_article(self, client, auth_headers, sample_article):
        """Test unpublishing a published article."""
        response = client.post(
            f"/api/v1/articles/{sample_article.id}/unpublish",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "draft"

    def test_publish_nonexistent_article_fails(self, client, auth_headers):
        """Test publishing non-existent article fails."""
        response = client.post(
            "/api/v1/articles/99999/publish",
            headers=auth_headers
        )

        assert response.status_code == 404


class TestArticleUpdate:
    """Test article update functionality."""

    def test_update_article_title(self, client, auth_headers, sample_article):
        """Test updating article title."""
        update_data = {
            "title": "Updated Title"
        }

        response = client.put(
            f"/api/v1/articles/{sample_article.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["slug"] == sample_article.slug  # Slug should not change

    def test_update_article_content(self, client, auth_headers, sample_article):
        """Test updating article content."""
        update_data = {
            "content_md": "# Updated Content\n\nThis is the new content."
        }

        response = client.put(
            f"/api/v1/articles/{sample_article.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "Updated Content" in data["content_md"]

    def test_update_article_tags(self, client, auth_headers, sample_article, sample_tags):
        """Test updating article tags."""
        update_data = {
            "tag_ids": [sample_tags[1].id, sample_tags[2].id]
        }

        response = client.put(
            f"/api/v1/articles/{sample_article.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["tags"]) == 2
        tag_slugs = [tag["slug"] for tag in data["tags"]]
        assert "javascript" in tag_slugs
        assert "data-science" in tag_slugs

    def test_update_article_featured_status(self, client, auth_headers, sample_article):
        """Test updating article featured status."""
        update_data = {
            "featured": True
        }

        response = client.put(
            f"/api/v1/articles/{sample_article.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["featured"] is True

    def test_update_nonexistent_article_fails(self, client, auth_headers):
        """Test updating non-existent article fails."""
        update_data = {"title": "Should Fail"}

        response = client.put(
            "/api/v1/articles/99999",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_update_article_without_auth_fails(self, client, sample_article):
        """Test updating article without authentication fails."""
        update_data = {"title": "Unauthorized Update"}

        response = client.put(
            f"/api/v1/articles/{sample_article.id}",
            json=update_data
        )

        assert response.status_code == 401


class TestArticleDelete:
    """Test article deletion functionality."""

    def test_delete_article(self, client, auth_headers, sample_article):
        """Test deleting an article."""
        article_id = sample_article.id

        response = client.delete(
            f"/api/v1/articles/{article_id}",
            headers=auth_headers
        )

        assert response.status_code == 204

        # Verify article is deleted
        get_response = client.get(
            f"/api/v1/articles/id/{article_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404

    def test_delete_nonexistent_article_fails(self, client, auth_headers):
        """Test deleting non-existent article fails."""
        response = client.delete(
            "/api/v1/articles/99999",
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_delete_article_without_auth_fails(self, client, sample_article):
        """Test deleting article without authentication fails."""
        response = client.delete(f"/api/v1/articles/{sample_article.id}")
        assert response.status_code == 401


class TestArticleRetrieval:
    """Test article retrieval and listing."""

    def test_get_published_articles(self, client, sample_article):
        """Test getting list of published articles (public endpoint)."""
        response = client.get("/api/v1/articles/")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1
        assert len(data["items"]) >= 1

    def test_get_all_articles_admin(self, client, auth_headers, db_session, sample_article):
        """Test getting all articles including drafts (admin only)."""
        # Create a draft article
        draft = Article(
            title="Draft Article",
            slug="draft-article",
            content_md="Draft content",
            status=ArticleStatus.DRAFT.value
        )
        db_session.add(draft)
        db_session.commit()

        response = client.get(
            "/api/v1/articles/admin",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 2  # At least published and draft

    def test_get_article_by_slug(self, client, sample_article):
        """Test getting article by slug."""
        response = client.get(f"/api/v1/articles/{sample_article.slug}")

        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == sample_article.slug
        assert data["title"] == sample_article.title

    def test_get_article_by_id_admin(self, client, auth_headers, sample_article):
        """Test getting article by ID (admin only)."""
        response = client.get(
            f"/api/v1/articles/id/{sample_article.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_article.id

    def test_get_articles_pagination(self, client, auth_headers, db_session):
        """Test article pagination."""
        # Create multiple articles
        for i in range(15):
            article = Article(
                title=f"Article {i}",
                slug=f"article-{i}",
                content_md=f"Content {i}",
                status=ArticleStatus.PUBLISHED.value
            )
            db_session.add(article)
        db_session.commit()

        # Get first page
        response = client.get("/api/v1/articles/?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["page"] == 1
        assert data["pages"] >= 2

        # Get second page
        response = client.get("/api/v1/articles/?page=2&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 5

    def test_get_articles_filtered_by_tag(self, client, sample_article, sample_tags):
        """Test filtering articles by tag."""
        response = client.get(f"/api/v1/articles/?tag={sample_tags[0].slug}")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        # Verify returned articles have the tag
        for item in data["items"]:
            tag_slugs = [tag["slug"] for tag in item["tags"]]
            assert sample_tags[0].slug in tag_slugs

    def test_get_featured_articles(self, client, db_session, sample_tags):
        """Test getting featured articles."""
        # Create a featured article
        featured = Article(
            title="Featured Article",
            slug="featured-article",
            content_md="Featured content",
            status=ArticleStatus.PUBLISHED.value,
            featured=True
        )
        db_session.add(featured)
        db_session.commit()

        response = client.get("/api/v1/articles/?featured=true")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        for item in data["items"]:
            assert item["featured"] is True

    def test_view_count_increments(self, client, sample_article, db_session):
        """Test that view count increments when article is viewed."""
        initial_views = sample_article.view_count

        # View the article
        client.get(f"/api/v1/articles/{sample_article.slug}")

        # Refresh and check view count
        db_session.refresh(sample_article)
        assert sample_article.view_count == initial_views + 1


class TestTagAssociations:
    """Test tag associations with articles."""

    def test_article_with_no_tags(self, client, auth_headers):
        """Test creating article with no tags."""
        article_data = {
            "title": "No Tags Article",
            "slug": "no-tags-article",
            "content_md": "Content without tags",
            "status": "draft"
        }

        response = client.post(
            "/api/v1/articles/",
            json=article_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert len(data["tags"]) == 0

    def test_add_tags_to_existing_article(self, client, auth_headers, db_session, sample_tags):
        """Test adding tags to existing article."""
        # Create article without tags
        article = Article(
            title="Article Without Tags",
            slug="article-without-tags",
            content_md="Content",
            status=ArticleStatus.DRAFT.value
        )
        db_session.add(article)
        db_session.commit()
        db_session.refresh(article)

        # Add tags
        update_data = {
            "tag_ids": [sample_tags[0].id, sample_tags[1].id]
        }

        response = client.put(
            f"/api/v1/articles/{article.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["tags"]) == 2

    def test_remove_all_tags_from_article(self, client, auth_headers, sample_article):
        """Test removing all tags from article."""
        update_data = {
            "tag_ids": []
        }

        response = client.put(
            f"/api/v1/articles/{sample_article.id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["tags"]) == 0
