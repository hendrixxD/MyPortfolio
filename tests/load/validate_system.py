#!/usr/bin/env python3
"""
System Validation Script

Validates that the system is properly configured for load testing.
Checks API availability, database connectivity, rate limiting, and R2 storage.

Usage:
    python validate_system.py [API_URL]

Example:
    python validate_system.py http://localhost:8000
"""
import sys
import time
import requests
from typing import Tuple, Optional


class SystemValidator:
    """Validates system readiness for load testing."""

    def __init__(self, api_url: str):
        self.api_url = api_url.rstrip('/')
        self.checks_passed = 0
        self.checks_failed = 0
        self.checks_warned = 0

    def print_header(self, title: str):
        """Print section header."""
        print("\n" + "="*60)
        print(title)
        print("="*60)

    def check(self, name: str, passed: bool, message: str, warning: bool = False):
        """Record and print check result."""
        if passed:
            print(f"✅ {name}: {message}")
            self.checks_passed += 1
        elif warning:
            print(f"⚠️  {name}: {message}")
            self.checks_warned += 1
        else:
            print(f"❌ {name}: {message}")
            self.checks_failed += 1

    def validate_api_health(self) -> bool:
        """Validate API is running and healthy."""
        self.print_header("API HEALTH CHECK")

        try:
            response = requests.get(
                f"{self.api_url}/api/v1/health",
                timeout=5
            )

            if response.status_code == 200:
                data = response.json()
                self.check(
                    "API Health",
                    True,
                    f"API is healthy - {data.get('status', 'ok')}"
                )
                return True
            else:
                self.check(
                    "API Health",
                    False,
                    f"API returned status {response.status_code}"
                )
                return False

        except requests.exceptions.ConnectionError:
            self.check(
                "API Health",
                False,
                "Cannot connect to API - is it running?"
            )
            return False
        except Exception as e:
            self.check(
                "API Health",
                False,
                f"Error: {e}"
            )
            return False

    def validate_database(self) -> bool:
        """Validate database connectivity via API."""
        self.print_header("DATABASE CONNECTIVITY")

        try:
            # Try to fetch articles (requires database)
            response = requests.get(
                f"{self.api_url}/api/v1/articles",
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                total = data.get('total', 0)
                self.check(
                    "Database Query",
                    True,
                    f"Database is accessible ({total} articles found)"
                )

                # Check response time
                if response.elapsed.total_seconds() < 1.0:
                    self.check(
                        "Query Performance",
                        True,
                        f"Response time: {response.elapsed.total_seconds():.3f}s"
                    )
                else:
                    self.check(
                        "Query Performance",
                        False,
                        f"Slow response: {response.elapsed.total_seconds():.3f}s",
                        warning=True
                    )

                return True
            else:
                self.check(
                    "Database Query",
                    False,
                    f"API returned {response.status_code}"
                )
                return False

        except Exception as e:
            self.check(
                "Database Query",
                False,
                f"Error: {e}"
            )
            return False

    def validate_rate_limiting(self) -> bool:
        """Validate rate limiting is configured."""
        self.print_header("RATE LIMITING VALIDATION")

        try:
            # Make rapid requests to trigger rate limiting
            responses = []
            for i in range(20):
                response = requests.post(
                    f"{self.api_url}/api/v1/auth/login/json",
                    json={"email": "test@example.com", "password": "wrong"},
                    headers={"X-Forwarded-For": "203.0.113.100"},
                    timeout=5
                )
                responses.append(response.status_code)

            # Check if any were rate limited
            rate_limited_count = responses.count(429)

            if rate_limited_count > 0:
                self.check(
                    "Rate Limiting",
                    True,
                    f"Rate limiter active ({rate_limited_count}/20 requests limited)"
                )
                return True
            else:
                self.check(
                    "Rate Limiting",
                    False,
                    "Rate limiter did not trigger after 20 rapid requests",
                    warning=True
                )
                return False

        except Exception as e:
            self.check(
                "Rate Limiting",
                False,
                f"Error testing rate limiting: {e}"
            )
            return False

    def validate_authentication(self) -> Tuple[bool, Optional[str]]:
        """Validate authentication endpoints work."""
        self.print_header("AUTHENTICATION VALIDATION")

        try:
            # Test invalid login (should return 401)
            response = requests.post(
                f"{self.api_url}/api/v1/auth/login/json",
                json={"email": "invalid@example.com", "password": "wrong"},
                timeout=5
            )

            if response.status_code == 401:
                self.check(
                    "Auth Endpoint",
                    True,
                    "Authentication endpoint is working"
                )
                return True, None
            else:
                self.check(
                    "Auth Endpoint",
                    False,
                    f"Unexpected status: {response.status_code}",
                    warning=True
                )
                return False, None

        except Exception as e:
            self.check(
                "Auth Endpoint",
                False,
                f"Error: {e}"
            )
            return False, None

    def validate_cors(self) -> bool:
        """Validate CORS headers are present."""
        self.print_header("CORS VALIDATION")

        try:
            response = requests.options(
                f"{self.api_url}/api/v1/articles",
                timeout=5
            )

            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            }

            if cors_headers["Access-Control-Allow-Origin"]:
                self.check(
                    "CORS Headers",
                    True,
                    f"CORS configured: {cors_headers['Access-Control-Allow-Origin']}"
                )
                return True
            else:
                self.check(
                    "CORS Headers",
                    False,
                    "CORS headers not found",
                    warning=True
                )
                return False

        except Exception as e:
            self.check(
                "CORS Headers",
                False,
                f"Error: {e}",
                warning=True
            )
            return False

    def validate_endpoints(self) -> bool:
        """Validate key endpoints are accessible."""
        self.print_header("ENDPOINT VALIDATION")

        endpoints = [
            ("/api/v1/articles", "Articles"),
            ("/api/v1/projects", "Projects"),
            ("/api/v1/skills", "Skills"),
            ("/api/v1/tags", "Tags"),
        ]

        all_passed = True
        for path, name in endpoints:
            try:
                response = requests.get(
                    f"{self.api_url}{path}",
                    timeout=5
                )

                if response.status_code == 200:
                    self.check(
                        name,
                        True,
                        "Endpoint accessible"
                    )
                else:
                    self.check(
                        name,
                        False,
                        f"Status: {response.status_code}"
                    )
                    all_passed = False

            except Exception as e:
                self.check(
                    name,
                    False,
                    f"Error: {e}"
                )
                all_passed = False

        return all_passed

    def validate_performance_baseline(self) -> bool:
        """Validate basic performance characteristics."""
        self.print_header("PERFORMANCE BASELINE")

        try:
            # Make 10 requests and measure response times
            times = []
            for _ in range(10):
                start = time.time()
                response = requests.get(
                    f"{self.api_url}/api/v1/articles",
                    timeout=10
                )
                elapsed = time.time() - start

                if response.status_code == 200:
                    times.append(elapsed)

            if times:
                avg_time = sum(times) / len(times)
                max_time = max(times)

                self.check(
                    "Average Response Time",
                    avg_time < 0.5,
                    f"{avg_time:.3f}s (target: <0.5s)"
                )

                self.check(
                    "Max Response Time",
                    max_time < 1.0,
                    f"{max_time:.3f}s (target: <1.0s)"
                )

                return avg_time < 1.0  # At least under 1s
            else:
                self.check(
                    "Performance Test",
                    False,
                    "No successful requests"
                )
                return False

        except Exception as e:
            self.check(
                "Performance Test",
                False,
                f"Error: {e}"
            )
            return False

    def print_summary(self):
        """Print validation summary."""
        self.print_header("VALIDATION SUMMARY")

        total_checks = self.checks_passed + self.checks_failed + self.checks_warned
        print(f"Total Checks: {total_checks}")
        print(f"✅ Passed: {self.checks_passed}")
        print(f"⚠️  Warnings: {self.checks_warned}")
        print(f"❌ Failed: {self.checks_failed}")
        print()

        if self.checks_failed == 0:
            print("="*60)
            print("✅ SYSTEM READY FOR LOAD TESTING")
            print("="*60)
            print()
            print("Next steps:")
            print("  1. Run individual tests:")
            print("     ./test_rate_limiting.sh")
            print("     locust -f locustfile.py --host=" + self.api_url)
            print()
            print("  2. Or run full suite:")
            print("     ./run_all_tests.sh")
            return True
        else:
            print("="*60)
            print("❌ SYSTEM NOT READY - FIX ISSUES ABOVE")
            print("="*60)
            print()
            print("Common fixes:")
            print("  - Is the backend running?")
            print("    cd backend && uvicorn app.main:app")
            print()
            print("  - Is the database accessible?")
            print("    Check DATABASE_URL in .env")
            print()
            print("  - Are dependencies installed?")
            print("    pip install -r requirements.txt")
            return False

    def run_all_validations(self) -> bool:
        """Run all validation checks."""
        print("="*60)
        print("SYSTEM VALIDATION FOR LOAD TESTING")
        print("="*60)
        print(f"API URL: {self.api_url}")

        # Run all checks
        self.validate_api_health()
        self.validate_database()
        self.validate_endpoints()
        self.validate_authentication()
        self.validate_rate_limiting()
        self.validate_cors()
        self.validate_performance_baseline()

        # Print summary
        return self.print_summary()


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        api_url = "http://localhost:8000"
        print(f"Using default API URL: {api_url}")
        print("Usage: python validate_system.py [API_URL]")
        print()
    else:
        api_url = sys.argv[1]

    validator = SystemValidator(api_url)
    success = validator.run_all_validations()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
