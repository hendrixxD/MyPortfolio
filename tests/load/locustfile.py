"""
Load testing script using Locust for portfolio API.

Tests database connection pool stress, query latency, and system performance.

Usage:
    locust -f locustfile.py --host=http://localhost:8000

Or with headless mode:
    locust -f locustfile.py --host=http://localhost:8000 \
           --users 50 --spawn-rate 5 --run-time 5m --headless
"""
from locust import HttpUser, task, between, events
import random
import time
from datetime import datetime


class PortfolioUser(HttpUser):
    """
    Simulates a user browsing the portfolio website.

    Focuses on read-heavy operations that stress the database connection pool.
    """
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks

    # Track performance metrics
    query_times = []
    connection_errors = 0

    def on_start(self):
        """Called when a simulated user starts."""
        self.article_slugs = []
        self.load_article_slugs()

    def load_article_slugs(self):
        """Load available article slugs for realistic testing."""
        try:
            response = self.client.get("/api/v1/articles/slugs", timeout=10)
            if response.status_code == 200:
                self.article_slugs = response.json()
        except Exception as e:
            print(f"Failed to load article slugs: {e}")

    @task(10)
    def get_articles_list(self):
        """
        Most common operation: browse articles list.
        Tests pagination and database query performance.
        """
        page = random.randint(1, 5)
        page_size = random.choice([10, 20, 50])

        start_time = time.time()
        with self.client.get(
            f"/api/v1/articles?page={page}&page_size={page_size}",
            catch_response=True,
            name="/api/v1/articles [LIST]"
        ) as response:
            elapsed = time.time() - start_time
            self.query_times.append(elapsed)

            if response.status_code == 200:
                response.success()
            elif response.status_code == 500:
                self.connection_errors += 1
                response.failure("Database connection error")
            else:
                response.failure(f"Unexpected status: {response.status_code}")

    @task(5)
    def get_article_detail(self):
        """
        Read article detail - tests single article query performance.
        """
        if not self.article_slugs:
            return

        slug = random.choice(self.article_slugs)
        start_time = time.time()

        with self.client.get(
            f"/api/v1/articles/{slug}",
            catch_response=True,
            name="/api/v1/articles/:slug [DETAIL]"
        ) as response:
            elapsed = time.time() - start_time
            self.query_times.append(elapsed)

            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                response.success()  # Expected for some slugs
            elif response.status_code == 500:
                self.connection_errors += 1
                response.failure("Database connection error")
            else:
                response.failure(f"Unexpected status: {response.status_code}")

    @task(3)
    def get_articles_with_filters(self):
        """
        Filtered article search - tests complex queries.
        """
        filters = {
            "featured": random.choice([True, False]),
            "search": random.choice(["", "data", "python", "engineering"]),
        }

        params = "&".join([f"{k}={v}" for k, v in filters.items() if v])
        start_time = time.time()

        with self.client.get(
            f"/api/v1/articles?{params}",
            catch_response=True,
            name="/api/v1/articles [FILTERED]"
        ) as response:
            elapsed = time.time() - start_time
            self.query_times.append(elapsed)

            if response.status_code == 200:
                response.success()
            elif response.status_code == 500:
                self.connection_errors += 1
                response.failure("Database connection error")
            else:
                response.failure(f"Unexpected status: {response.status_code}")

    @task(2)
    def get_projects(self):
        """Test projects endpoint."""
        with self.client.get("/api/v1/projects", name="/api/v1/projects [LIST]"):
            pass

    @task(2)
    def get_skills(self):
        """Test skills endpoint."""
        with self.client.get("/api/v1/skills", name="/api/v1/skills [LIST]"):
            pass

    @task(1)
    def get_tags(self):
        """Test tags endpoint."""
        with self.client.get("/api/v1/tags", name="/api/v1/tags [LIST]"):
            pass

    @task(1)
    def health_check(self):
        """Health check endpoint - minimal database usage."""
        with self.client.get("/api/v1/health", name="/api/v1/health"):
            pass


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """
    Calculate and report performance metrics when test stops.
    """
    if PortfolioUser.query_times:
        sorted_times = sorted(PortfolioUser.query_times)
        count = len(sorted_times)

        p50_index = int(count * 0.50)
        p95_index = int(count * 0.95)
        p99_index = int(count * 0.99)

        p50 = sorted_times[p50_index] * 1000  # Convert to ms
        p95 = sorted_times[p95_index] * 1000
        p99 = sorted_times[p99_index] * 1000

        print("\n" + "="*60)
        print("DATABASE PERFORMANCE METRICS")
        print("="*60)
        print(f"Total Queries: {count}")
        print(f"P50 Latency: {p50:.2f}ms")
        print(f"P95 Latency: {p95:.2f}ms")
        print(f"P99 Latency: {p99:.2f}ms")
        print(f"Connection Errors: {PortfolioUser.connection_errors}")
        print("="*60)

        # Validate performance against SLA
        if p95 > 300:
            print(f"⚠️  WARNING: P95 latency ({p95:.2f}ms) exceeds SLA (300ms)")
        else:
            print(f"✅ PASS: P95 latency ({p95:.2f}ms) within SLA (300ms)")

        if PortfolioUser.connection_errors > 0:
            print(f"❌ FAIL: {PortfolioUser.connection_errors} connection pool errors detected")
        else:
            print("✅ PASS: No connection pool exhaustion")

        print("="*60 + "\n")


class AdminUser(HttpUser):
    """
    Simulates admin operations (less frequent, more write operations).
    """
    wait_time = between(5, 10)

    def on_start(self):
        """Login as admin (simulated - adjust for your auth)."""
        # Note: Implement actual admin login if needed
        pass

    @task(1)
    def view_analytics(self):
        """Admin views analytics."""
        with self.client.get("/api/v1/analytics/visitors", name="/api/v1/analytics [ADMIN]"):
            pass
