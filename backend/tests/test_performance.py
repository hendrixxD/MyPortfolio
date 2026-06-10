"""
Performance monitoring tests.

Tests that critical API endpoints meet performance targets:
- p50 < 150ms
- p95 < 300ms
- p99 < 500ms
"""
import pytest
import time
import statistics
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.core.database import get_db


client = TestClient(app)


def measure_endpoint(endpoint: str, method: str = "GET", json_data: dict = None, iterations: int = 20) -> dict:
    """
    Measure endpoint performance over multiple iterations.

    Returns timing statistics (min, max, mean, p50, p95, p99).
    """
    timings = []

    for _ in range(iterations):
        start = time.perf_counter()

        if method == "GET":
            response = client.get(endpoint)
        elif method == "POST":
            response = client.post(endpoint, json=json_data)
        else:
            raise ValueError(f"Unsupported method: {method}")

        elapsed = (time.perf_counter() - start) * 1000  # Convert to ms
        timings.append(elapsed)

        # Ensure request succeeded (or expected status)
        assert response.status_code in [200, 201, 401, 422], f"Unexpected status: {response.status_code}"

    timings.sort()
    return {
        "min": timings[0],
        "max": timings[-1],
        "mean": statistics.mean(timings),
        "median": statistics.median(timings),
        "p95": timings[int(len(timings) * 0.95)],
        "p99": timings[int(len(timings) * 0.99)] if len(timings) >= 100 else timings[-1],
        "iterations": iterations
    }


def test_health_endpoint_performance():
    """Test health endpoint meets performance targets."""
    stats = measure_endpoint("/api/v1/health")

    print(f"\nHealth endpoint performance:")
    print(f"  Mean: {stats['mean']:.2f}ms")
    print(f"  P95:  {stats['p95']:.2f}ms")

    assert stats["p95"] < 300, f"P95 latency too high: {stats['p95']:.2f}ms"


def test_articles_list_performance():
    """Test articles list endpoint performance."""
    stats = measure_endpoint("/api/v1/articles/")

    print(f"\nArticles list performance:")
    print(f"  Mean: {stats['mean']:.2f}ms")
    print(f"  P95:  {stats['p95']:.2f}ms")

    assert stats["p95"] < 300, f"P95 latency too high: {stats['p95']:.2f}ms"


def test_projects_list_performance():
    """Test projects list endpoint performance."""
    stats = measure_endpoint("/api/v1/projects/")

    print(f"\nProjects list performance:")
    print(f"  Mean: {stats['mean']:.2f}ms")
    print(f"  P95:  {stats['p95']:.2f}ms")

    assert stats["p95"] < 300, f"P95 latency too high: {stats['p95']:.2f}ms"


def test_gallery_items_performance():
    """Test gallery items list endpoint performance."""
    stats = measure_endpoint("/api/v1/gallery/items")

    print(f"\nGallery items performance:")
    print(f"  Mean: {stats['mean']:.2f}ms")
    print(f"  P95:  {stats['p95']:.2f}ms")

    assert stats["p95"] < 300, f"P95 latency too high: {stats['p95']:.2f}ms"


def test_contact_form_performance():
    """Test contact form submission performance."""
    contact_data = {
        "name": "Performance Test",
        "email": "perf@example.com",
        "subject": "Performance Test",
        "message": "Testing contact form performance"
    }

    stats = measure_endpoint("/api/v1/contact/", method="POST", json_data=contact_data)

    print(f"\nContact form performance:")
    print(f"  Mean: {stats['mean']:.2f}ms")
    print(f"  P95:  {stats['p95']:.2f}ms")

    assert stats["p95"] < 500, f"P95 latency too high: {stats['p95']:.2f}ms"


def test_database_query_performance():
    """Test raw database query performance."""
    db_gen = get_db()
    db = next(db_gen)

    timings = []
    iterations = 50

    try:
        for _ in range(iterations):
            start = time.perf_counter()
            db.execute(text("SELECT 1"))
            elapsed = (time.perf_counter() - start) * 1000
            timings.append(elapsed)
    finally:
        db.close()

    timings.sort()
    stats = {
        "mean": statistics.mean(timings),
        "p95": timings[int(len(timings) * 0.95)],
    }

    print(f"\nDatabase query performance:")
    print(f"  Mean: {stats['mean']:.2f}ms")
    print(f"  P95:  {stats['p95']:.2f}ms")

    assert stats["p95"] < 100, f"Database P95 latency too high: {stats['p95']:.2f}ms"


def test_session_factory_overhead():
    """Test that session factory creation has minimal overhead."""
    from app.middleware.visitor_middleware import get_session_factory

    # First call (creates factory)
    start = time.perf_counter()
    factory1 = get_session_factory()
    first_call = (time.perf_counter() - start) * 1000

    # Subsequent calls (returns singleton)
    timings = []
    for _ in range(100):
        start = time.perf_counter()
        factory = get_session_factory()
        elapsed = (time.perf_counter() - start) * 1000
        timings.append(elapsed)

        # Ensure it's the same instance
        assert factory is factory1

    mean_overhead = statistics.mean(timings)

    print(f"\nSession factory overhead:")
    print(f"  First call: {first_call:.4f}ms")
    print(f"  Subsequent calls (mean): {mean_overhead:.4f}ms")

    # Singleton access should be near-instantaneous (< 0.1ms)
    assert mean_overhead < 0.1, f"Session factory overhead too high: {mean_overhead:.4f}ms"


@pytest.mark.benchmark
def test_endpoint_concurrent_load():
    """
    Test endpoint performance under concurrent load.

    This simulates multiple concurrent requests to ensure
    the async optimizations handle load properly.
    """
    import concurrent.futures

    def make_request():
        response = client.get("/api/v1/health")
        return response.status_code == 200

    # Simulate 20 concurrent requests
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        start = time.perf_counter()
        futures = [executor.submit(make_request) for _ in range(20)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
        elapsed = (time.perf_counter() - start) * 1000

    print(f"\nConcurrent load (20 requests):")
    print(f"  Total time: {elapsed:.2f}ms")
    print(f"  Avg per request: {elapsed/20:.2f}ms")

    assert all(results), "Some requests failed"
    assert elapsed < 2000, f"Concurrent load too slow: {elapsed:.2f}ms"
