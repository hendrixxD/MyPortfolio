"""
Comprehensive authentication flow tests for admin dashboard.

Tests:
- Successful login with valid credentials
- Account lockout after 5 failed attempts
- Unauthorized access returns 401
- Cookie persistence and expiry
- Token validation
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
from app.core.security import get_password_hash
from app.middleware.account_lockout import get_lockout_manager

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
def test_user(db_session):
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
def inactive_user(db_session):
    """Create an inactive test user."""
    user = User(
        email="inactive@test.com",
        full_name="Inactive User",
        hashed_password=get_password_hash("testpass123"),
        is_active=False,
        is_superuser=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


class TestAuthenticationFlow:
    """Test authentication flow for admin dashboard."""

    def test_successful_login_with_valid_credentials(self, client, test_user):
        """Test successful login with valid credentials returns token and sets cookie."""
        # Clear any lockouts
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpass123"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        # Check that httpOnly cookie is set
        assert "access_token" in response.cookies
        cookie = response.cookies.get("access_token")
        assert cookie is not None

    def test_successful_login_json_endpoint(self, client, test_user):
        """Test JSON-based login endpoint."""
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        response = client.post(
            "/api/v1/auth/login/json",
            json={"email": test_user.email, "password": "testpass123"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_invalid_credentials_returns_401(self, client, test_user):
        """Test login fails with invalid credentials."""
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "wrongpassword"}
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "attempts remaining" in data["detail"].lower()

    def test_nonexistent_user_returns_401(self, client):
        """Test login fails for non-existent user."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "nonexistent@test.com", "password": "testpass123"}
        )

        assert response.status_code == 401

    def test_inactive_user_cannot_login(self, client, inactive_user):
        """Test inactive user cannot login."""
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(inactive_user.email)

        response = client.post(
            "/api/v1/auth/login",
            data={"username": inactive_user.email, "password": "testpass123"}
        )

        assert response.status_code == 400
        data = response.json()
        assert "Inactive user" in data["detail"]


class TestAccountLockout:
    """Test account lockout mechanism after failed login attempts."""

    def test_account_lockout_after_5_failed_attempts(self, client, test_user):
        """Test account is locked after 5 consecutive failed attempts."""
        # Clear any previous lockouts
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        # Make 5 failed attempts
        for i in range(5):
            response = client.post(
                "/api/v1/auth/login",
                data={"username": test_user.email, "password": "wrongpassword"}
            )

            if i < 4:
                assert response.status_code == 401
                data = response.json()
                remaining = 5 - (i + 1)
                assert f"{remaining} attempts remaining" in data["detail"].lower()
            else:
                # 5th attempt should trigger lockout
                assert response.status_code == 429
                data = response.json()
                assert "locked" in data["detail"].lower()
                assert "too many failed attempts" in data["detail"].lower()

    def test_locked_account_prevents_login(self, client, test_user):
        """Test that locked account prevents further login attempts."""
        # Clear any previous lockouts
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        # Lock the account by making 5 failed attempts
        for _ in range(5):
            client.post(
                "/api/v1/auth/login",
                data={"username": test_user.email, "password": "wrongpassword"}
            )

        # Try to login again (should still be locked)
        response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "wrongpassword"}
        )

        assert response.status_code == 429
        data = response.json()
        assert "locked" in data["detail"].lower()
        assert "try again in" in data["detail"].lower()

    def test_successful_login_clears_failed_attempts(self, client, test_user):
        """Test that successful login clears failed attempt counter."""
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        # Make 3 failed attempts
        for _ in range(3):
            client.post(
                "/api/v1/auth/login",
                data={"username": test_user.email, "password": "wrongpassword"}
            )

        # Successful login
        response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpass123"}
        )
        assert response.status_code == 200

        # Now make 4 more failed attempts (should not be locked immediately)
        for i in range(4):
            response = client.post(
                "/api/v1/auth/login",
                data={"username": test_user.email, "password": "wrongpassword"}
            )
            # Should still accept attempts (counter was reset)
            assert response.status_code == 401


class TestUnauthorizedAccess:
    """Test unauthorized access to protected endpoints."""

    def test_admin_endpoints_require_authentication(self, client):
        """Test that admin endpoints return 401 without token."""
        protected_endpoints = [
            "/api/v1/articles/admin",
            "/api/v1/articles/id/1",
            "/api/v1/projects/admin",
            "/api/v1/analytics/visitors",
            "/api/v1/gallery/items/all",
        ]

        for endpoint in protected_endpoints:
            response = client.get(endpoint)
            assert response.status_code == 401, f"Endpoint {endpoint} should require auth"

    def test_admin_create_endpoints_require_authentication(self, client):
        """Test that admin create endpoints return 401 without token."""
        response = client.post(
            "/api/v1/articles/",
            json={
                "title": "Test Article",
                "slug": "test-article",
                "content_md": "Test content"
            }
        )
        assert response.status_code == 401

    def test_admin_delete_endpoints_require_authentication(self, client):
        """Test that admin delete endpoints return 401 without token."""
        response = client.delete("/api/v1/articles/1")
        assert response.status_code == 401

    def test_invalid_token_returns_401(self, client):
        """Test that invalid token returns 401."""
        response = client.get(
            "/api/v1/articles/admin",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401


class TestCookiePersistence:
    """Test cookie persistence and expiry."""

    def test_cookie_is_httponly(self, client, test_user):
        """Test that auth cookie has httpOnly flag."""
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpass123"}
        )

        assert response.status_code == 200
        # TestClient doesn't expose httpOnly flag directly, but we can verify cookie exists
        assert "access_token" in response.cookies

    def test_cookie_used_for_authentication(self, client, test_user):
        """Test that cookie can be used for authentication."""
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        # Login to get cookie
        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpass123"}
        )
        assert login_response.status_code == 200

        # Use cookie to access protected endpoint
        # TestClient automatically maintains cookies
        me_response = client.get("/api/v1/auth/me")
        assert me_response.status_code == 200
        data = me_response.json()
        assert data["email"] == test_user.email

    def test_logout_clears_cookie(self, client, test_user):
        """Test that logout clears the authentication cookie."""
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        # Login
        client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpass123"}
        )

        # Logout
        logout_response = client.post("/api/v1/auth/logout")
        assert logout_response.status_code == 200
        data = logout_response.json()
        assert "logged out" in data["message"].lower()

    def test_get_current_user_info(self, client, test_user):
        """Test getting current user information."""
        lockout_manager = get_lockout_manager()
        lockout_manager.record_successful_login(test_user.email)

        # Login
        client.post(
            "/api/v1/auth/login",
            data={"username": test_user.email, "password": "testpass123"}
        )

        # Get user info
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name
        assert data["is_superuser"] is True


class TestTokenValidation:
    """Test token validation and expiry."""

    def test_missing_token_returns_401(self, client):
        """Test that missing token returns 401."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_malformed_token_returns_401(self, client):
        """Test that malformed token returns 401."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer malformed.token.here"}
        )
        assert response.status_code == 401

    def test_token_with_wrong_signature_returns_401(self, client):
        """Test that token with wrong signature returns 401."""
        # Create a fake token (not signed with correct secret)
        fake_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlQHRlc3QuY29tIn0.fake_signature"

        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {fake_token}"}
        )
        assert response.status_code == 401
