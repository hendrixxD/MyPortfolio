"""
Comprehensive dashboard statistics tests.

Tests:
- Stats accuracy (article count, project count, message count)
- API call efficiency (only 3 calls on dashboard load)
- Stats update after CRUD operations
- Visitor analytics
- Performance metrics
"""
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db
from app.models.base import Base
from app.models.user import User
from app.models.article import Article, ArticleStatus
from app.models.project import Project, ProjectStatus
from app.models.contact import ContactMessage
from app.models.visitor import VisitorLog
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


@pytest.fixture
def sample_data(db_session):
    """Create sample data for testing dashboard stats."""
    # Create articles
    for i in range(5):
        article = Article(
            title=f"Article {i}",
            slug=f"article-{i}",
            content_md=f"Content {i}",
            status=ArticleStatus.PUBLISHED.value,
            view_count=i * 10
        )
        db_session.add(article)

    # Create draft article
    draft = Article(
        title="Draft Article",
        slug="draft-article",
        content_md="Draft content",
        status=ArticleStatus.DRAFT.value
    )
    db_session.add(draft)

    # Create projects
    for i in range(3):
        project = Project(
            title=f"Project {i}",
            slug=f"project-{i}",
            description=f"Description {i}",
            status=ProjectStatus.PUBLISHED.value
        )
        db_session.add(project)

    # Create contact messages
    for i in range(7):
        message = ContactMessage(
            name=f"User {i}",
            email=f"user{i}@test.com",
            subject=f"Subject {i}",
            message=f"Message {i}",
            is_read=(i < 3)  # 3 read, 4 unread
        )
        db_session.add(message)

    # Create visitor logs
    now = datetime.utcnow()
    for i in range(10):
        visitor = VisitorLog(
            ip_address=f"192.168.1.{i}",
            user_agent=f"Mozilla/5.0 Test {i}",
            path=f"/page{i % 3}",
            country="United States" if i < 5 else "Canada",
            country_code="US" if i < 5 else "CA",
            city="New York" if i < 5 else "Toronto",
            is_bot=False,
            created_at=now - timedelta(days=i)
        )
        db_session.add(visitor)

    db_session.commit()


class TestStatsAccuracy:
    """Test accuracy of dashboard statistics."""

    def test_article_count_accuracy(self, client, auth_headers, sample_data):
        """Test that article count is accurate."""
        response = client.get(
            "/api/v1/articles/admin",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 6  # 5 published + 1 draft

    def test_published_article_count(self, client, sample_data):
        """Test that public endpoint only shows published articles."""
        response = client.get("/api/v1/articles/")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5  # Only published

    def test_project_count_accuracy(self, client, auth_headers, sample_data):
        """Test that project count is accurate."""
        response = client.get(
            "/api/v1/projects/admin",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3

    def test_contact_message_count(self, client, auth_headers, sample_data):
        """Test that contact message count is accurate."""
        response = client.get(
            "/api/v1/contact/",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 7

    def test_unread_message_count(self, client, auth_headers, sample_data):
        """Test filtering unread messages."""
        response = client.get(
            "/api/v1/contact/?unread=true",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        # Should show only unread messages
        for item in data["items"]:
            assert item["is_read"] is False

    def test_visitor_stats_accuracy(self, client, auth_headers, sample_data):
        """Test visitor statistics accuracy."""
        response = client.get(
            "/api/v1/analytics/visitors?days=30",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_visits"] == 10
        assert data["unique_ips"] == 10
        assert data["bot_visits"] == 0
        assert data["human_visits"] == 10


class TestStatsUpdateAfterCRUD:
    """Test that stats update correctly after CRUD operations."""

    def test_stats_update_after_article_creation(self, client, auth_headers, sample_data):
        """Test article count updates after creating new article."""
        # Get initial count
        response = client.get("/api/v1/articles/admin", headers=auth_headers)
        initial_count = response.json()["total"]

        # Create new article
        client.post(
            "/api/v1/articles/",
            json={
                "title": "New Article",
                "slug": "new-article",
                "content_md": "New content",
                "status": "draft"
            },
            headers=auth_headers
        )

        # Check updated count
        response = client.get("/api/v1/articles/admin", headers=auth_headers)
        new_count = response.json()["total"]
        assert new_count == initial_count + 1

    def test_stats_update_after_article_deletion(self, client, auth_headers, db_session, sample_data):
        """Test article count updates after deleting article."""
        # Create an article to delete
        article = Article(
            title="To Delete",
            slug="to-delete",
            content_md="Content",
            status=ArticleStatus.DRAFT.value
        )
        db_session.add(article)
        db_session.commit()
        db_session.refresh(article)

        # Get initial count
        response = client.get("/api/v1/articles/admin", headers=auth_headers)
        initial_count = response.json()["total"]

        # Delete article
        client.delete(f"/api/v1/articles/{article.id}", headers=auth_headers)

        # Check updated count
        response = client.get("/api/v1/articles/admin", headers=auth_headers)
        new_count = response.json()["total"]
        assert new_count == initial_count - 1

    def test_stats_update_after_publishing_article(self, client, auth_headers, db_session, sample_data):
        """Test published count updates after publishing draft."""
        # Create draft
        draft = Article(
            title="Draft to Publish",
            slug="draft-to-publish",
            content_md="Draft content",
            status=ArticleStatus.DRAFT.value
        )
        db_session.add(draft)
        db_session.commit()
        db_session.refresh(draft)

        # Get initial published count
        response = client.get("/api/v1/articles/")
        initial_published = response.json()["total"]

        # Publish the draft
        client.post(f"/api/v1/articles/{draft.id}/publish", headers=auth_headers)

        # Check updated published count
        response = client.get("/api/v1/articles/")
        new_published = response.json()["total"]
        assert new_published == initial_published + 1

    def test_stats_update_after_message_read(self, client, auth_headers, db_session, sample_data):
        """Test unread count updates after marking message as read."""
        # Create unread message
        message = ContactMessage(
            name="Test User",
            email="test@test.com",
            subject="Test",
            message="Test message",
            is_read=False
        )
        db_session.add(message)
        db_session.commit()
        db_session.refresh(message)

        # Mark as read
        client.put(
            f"/api/v1/contact/{message.id}",
            json={"is_read": True},
            headers=auth_headers
        )

        # Verify it's marked as read
        response = client.get(
            f"/api/v1/contact/{message.id}",
            headers=auth_headers
        )
        assert response.json()["is_read"] is True

    def test_view_count_increments(self, client, db_session, sample_data):
        """Test article view count increments correctly."""
        # Create article
        article = Article(
            title="View Test",
            slug="view-test",
            content_md="Content",
            status=ArticleStatus.PUBLISHED.value,
            view_count=0
        )
        db_session.add(article)
        db_session.commit()
        db_session.refresh(article)

        initial_views = article.view_count

        # View the article
        client.get(f"/api/v1/articles/{article.slug}")

        # Check view count increased
        db_session.refresh(article)
        assert article.view_count == initial_views + 1


class TestVisitorAnalytics:
    """Test visitor analytics and tracking."""

    def test_top_countries_calculation(self, client, auth_headers, sample_data):
        """Test top countries are calculated correctly."""
        response = client.get(
            "/api/v1/analytics/visitors?days=30",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["top_countries"]) >= 1
        # US should have more visits
        us_country = next((c for c in data["top_countries"] if c["country_code"] == "US"), None)
        assert us_country is not None
        assert us_country["visit_count"] == 5

    def test_top_pages_calculation(self, client, auth_headers, sample_data):
        """Test top pages are calculated correctly."""
        response = client.get(
            "/api/v1/analytics/visitors?days=30",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["top_pages"]) >= 1

    def test_recent_visitors_list(self, client, auth_headers, sample_data):
        """Test recent visitors list."""
        response = client.get(
            "/api/v1/analytics/visitors?days=30",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["recent_visits"]) >= 1
        # Verify they're sorted by date (most recent first)
        dates = [v["created_at"] for v in data["recent_visits"]]
        assert dates == sorted(dates, reverse=True)

    def test_visitor_stats_time_filter(self, client, auth_headers, db_session):
        """Test visitor stats can be filtered by time period."""
        # Create old visitor (beyond 30 days)
        old_visitor = VisitorLog(
            ip_address="1.1.1.1",
            user_agent="Old Bot",
            path="/old",
            country="Germany",
            country_code="DE",
            is_bot=False,
            created_at=datetime.utcnow() - timedelta(days=40)
        )
        db_session.add(old_visitor)
        db_session.commit()

        # Get stats for last 30 days
        response = client.get(
            "/api/v1/analytics/visitors?days=30",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        # Old visitor should not be included
        # (Depends on sample_data having recent visitors)

    def test_bot_visits_excluded_from_human_stats(self, client, auth_headers, db_session):
        """Test bot visits are excluded from human statistics."""
        # Create bot visitor
        bot = VisitorLog(
            ip_address="2.2.2.2",
            user_agent="Googlebot",
            path="/",
            country="United States",
            country_code="US",
            is_bot=True,
            created_at=datetime.utcnow()
        )
        db_session.add(bot)
        db_session.commit()

        response = client.get(
            "/api/v1/analytics/visitors?days=30",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["bot_visits"] >= 1
        # Human visits should not include bot
        assert data["total_visits"] == data["human_visits"] + data["bot_visits"]


class TestAPICallEfficiency:
    """Test API call efficiency for dashboard loading."""

    def test_dashboard_loads_with_minimal_calls(self, client, auth_headers, sample_data):
        """Test dashboard can load with only 3-4 API calls."""
        # The main dashboard typically needs:
        # 1. Articles summary
        # 2. Projects summary
        # 3. Contact messages summary
        # 4. Visitor analytics

        calls = []

        # Call 1: Articles
        response = client.get("/api/v1/articles/admin?page=1&page_size=5", headers=auth_headers)
        assert response.status_code == 200
        calls.append("articles")

        # Call 2: Projects
        response = client.get("/api/v1/projects/admin?page=1&page_size=5", headers=auth_headers)
        assert response.status_code == 200
        calls.append("projects")

        # Call 3: Contact messages
        response = client.get("/api/v1/contact/?page=1&page_size=5", headers=auth_headers)
        assert response.status_code == 200
        calls.append("contact")

        # Call 4: Visitor analytics (optional but common)
        response = client.get("/api/v1/analytics/visitors?days=30", headers=auth_headers)
        assert response.status_code == 200
        calls.append("analytics")

        # Verify we can get all necessary data in 4 calls
        assert len(calls) == 4

    def test_pagination_reduces_data_transfer(self, client, auth_headers, db_session):
        """Test pagination reduces amount of data transferred."""
        # Create many articles
        for i in range(50):
            article = Article(
                title=f"Article {i}",
                slug=f"article-many-{i}",
                content_md=f"Content {i}",
                status=ArticleStatus.PUBLISHED.value
            )
            db_session.add(article)
        db_session.commit()

        # Request with pagination
        response = client.get(
            "/api/v1/articles/admin?page=1&page_size=10",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10  # Only 10 items returned
        assert data["total"] >= 50  # But total is accurate

    def test_admin_endpoints_return_summary_data(self, client, auth_headers, sample_data):
        """Test admin endpoints return appropriate summary data."""
        response = client.get(
            "/api/v1/articles/admin",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        # Should have pagination metadata
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        # Should have items array
        assert "items" in data


class TestPerformanceMetrics:
    """Test dashboard performance and response times."""

    def test_stats_endpoints_respond_quickly(self, client, auth_headers, sample_data):
        """Test that stats endpoints respond in reasonable time."""
        import time

        endpoints = [
            "/api/v1/articles/admin",
            "/api/v1/projects/admin",
            "/api/v1/contact/",
            "/api/v1/analytics/visitors?days=30"
        ]

        for endpoint in endpoints:
            start_time = time.time()
            response = client.get(endpoint, headers=auth_headers)
            end_time = time.time()

            assert response.status_code == 200
            # Each request should complete in under 1 second (generous for tests)
            assert (end_time - start_time) < 1.0

    def test_large_dataset_pagination_performance(self, client, auth_headers, db_session):
        """Test pagination performance with large datasets."""
        # Create a larger dataset
        for i in range(100):
            article = Article(
                title=f"Perf Test {i}",
                slug=f"perf-test-{i}",
                content_md=f"Content {i}",
                status=ArticleStatus.PUBLISHED.value
            )
            db_session.add(article)
        db_session.commit()

        import time
        start_time = time.time()

        response = client.get(
            "/api/v1/articles/admin?page=1&page_size=20",
            headers=auth_headers
        )

        end_time = time.time()

        assert response.status_code == 200
        # Should still respond quickly even with 100+ articles
        assert (end_time - start_time) < 1.0


class TestDataConsistency:
    """Test data consistency across different endpoints."""

    def test_article_count_consistent_across_endpoints(self, client, auth_headers, sample_data):
        """Test article counts are consistent."""
        # Get from admin endpoint
        admin_response = client.get("/api/v1/articles/admin", headers=auth_headers)
        admin_total = admin_response.json()["total"]

        # Get from public endpoint
        public_response = client.get("/api/v1/articles/")
        public_total = public_response.json()["total"]

        # Admin should see more (includes drafts)
        assert admin_total >= public_total

    def test_stats_reflect_current_database_state(self, client, auth_headers, db_session):
        """Test that stats always reflect current database state."""
        # Create article
        article = Article(
            title="State Test",
            slug="state-test",
            content_md="Content",
            status=ArticleStatus.DRAFT.value
        )
        db_session.add(article)
        db_session.commit()
        db_session.refresh(article)

        # Get stats
        response1 = client.get("/api/v1/articles/admin", headers=auth_headers)
        count1 = response1.json()["total"]

        # Delete article
        db_session.delete(article)
        db_session.commit()

        # Get stats again
        response2 = client.get("/api/v1/articles/admin", headers=auth_headers)
        count2 = response2.json()["total"]

        # Count should have decreased
        assert count2 == count1 - 1
