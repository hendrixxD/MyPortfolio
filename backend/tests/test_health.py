"""
Basic API tests.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint returns API info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data


def test_health_endpoint():
    """Test health endpoint returns healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_docs_endpoint():
    """Test OpenAPI docs are accessible."""
    response = client.get("/docs")
    assert response.status_code == 200


def test_get_articles_empty():
    """Test articles endpoint returns empty list when no data."""
    response = client.get("/api/v1/articles/")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


def test_get_projects_empty():
    """Test projects endpoint returns empty list when no data."""
    response = client.get("/api/v1/projects/")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


def test_protected_endpoint_unauthorized():
    """Test protected endpoints require authentication."""
    response = client.get("/api/v1/articles/admin")
    assert response.status_code == 401


def test_login_invalid_credentials():
    """Test login fails with invalid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "invalid@test.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_contact_form_validation():
    """Test contact form validates input."""
    # Missing required fields
    response = client.post(
        "/api/v1/contact/",
        json={"name": "Test"}
    )
    assert response.status_code == 422  # Validation error


def test_contact_form_success():
    """Test contact form accepts valid input."""
    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"
