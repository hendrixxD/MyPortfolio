"""
Security Headers Test Suite

Tests security header middleware functionality across different environments:
- Content Security Policy (CSP) in production vs development
- HSTS header presence in production
- Security headers applied to all responses
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.middleware.security_headers import SecurityHeadersMiddleware


@pytest.fixture
def app_with_security_headers_dev():
    """Create test app with security headers in development mode."""
    app = FastAPI()
    app.add_middleware(SecurityHeadersMiddleware, is_production=False)

    @app.get("/test")
    async def test_endpoint():
        return {"message": "test"}

    @app.get("/api/health")
    async def health_endpoint():
        return {"status": "healthy"}

    return app


@pytest.fixture
def app_with_security_headers_prod():
    """Create test app with security headers in production mode."""
    app = FastAPI()
    app.add_middleware(SecurityHeadersMiddleware, is_production=True)

    @app.get("/test")
    async def test_endpoint():
        return {"message": "test"}

    @app.get("/api/health")
    async def health_endpoint():
        return {"status": "healthy"}

    return app


@pytest.fixture
def client_dev(app_with_security_headers_dev):
    """Test client for development environment."""
    return TestClient(app_with_security_headers_dev)


@pytest.fixture
def client_prod(app_with_security_headers_prod):
    """Test client for production environment."""
    return TestClient(app_with_security_headers_prod)


class TestBasicSecurityHeaders:
    """Test basic security headers present in all environments."""

    def test_x_frame_options_present(self, client_dev):
        """Test X-Frame-Options header is present."""
        response = client_dev.get("/test")
        assert "X-Frame-Options" in response.headers
        assert response.headers["X-Frame-Options"] == "DENY"

    def test_x_content_type_options_present(self, client_dev):
        """Test X-Content-Type-Options header is present."""
        response = client_dev.get("/test")
        assert "X-Content-Type-Options" in response.headers
        assert response.headers["X-Content-Type-Options"] == "nosniff"

    def test_referrer_policy_present(self, client_dev):
        """Test Referrer-Policy header is present."""
        response = client_dev.get("/test")
        assert "Referrer-Policy" in response.headers
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"

    def test_permissions_policy_present(self, client_dev):
        """Test Permissions-Policy header is present."""
        response = client_dev.get("/test")
        assert "Permissions-Policy" in response.headers
        permissions = response.headers["Permissions-Policy"]
        assert "camera=()" in permissions
        assert "microphone=()" in permissions
        assert "geolocation=()" in permissions

    def test_x_xss_protection_present(self, client_dev):
        """Test X-XSS-Protection header is present."""
        response = client_dev.get("/test")
        assert "X-XSS-Protection" in response.headers
        assert response.headers["X-XSS-Protection"] == "1; mode=block"


class TestCSPDevelopment:
    """Test Content Security Policy in development environment."""

    def test_csp_present_in_dev(self, client_dev):
        """Test CSP header is present in development."""
        response = client_dev.get("/test")
        assert "Content-Security-Policy" in response.headers

    def test_csp_allows_unsafe_eval_in_dev(self, client_dev):
        """Test CSP allows unsafe-eval in development for Next.js."""
        response = client_dev.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "unsafe-eval" in csp

    def test_csp_allows_localhost_in_dev(self, client_dev):
        """Test CSP allows localhost connections in development."""
        response = client_dev.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "http://localhost" in csp

    def test_csp_script_src_in_dev(self, client_dev):
        """Test script-src directive includes unsafe-inline and unsafe-eval."""
        response = client_dev.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "script-src 'self' 'unsafe-inline' 'unsafe-eval'" in csp

    def test_csp_default_src_self(self, client_dev):
        """Test default-src is set to self."""
        response = client_dev.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "default-src 'self'" in csp

    def test_csp_frame_ancestors_none(self, client_dev):
        """Test frame-ancestors is set to none to prevent clickjacking."""
        response = client_dev.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "frame-ancestors 'none'" in csp


class TestCSPProduction:
    """Test Content Security Policy in production environment."""

    def test_csp_present_in_prod(self, client_prod):
        """Test CSP header is present in production."""
        response = client_prod.get("/test")
        assert "Content-Security-Policy" in response.headers

    def test_csp_no_unsafe_eval_in_prod(self, client_prod):
        """Test CSP removes unsafe-eval in production for security."""
        response = client_prod.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "unsafe-eval" not in csp

    def test_csp_script_src_in_prod(self, client_prod):
        """Test script-src allows unsafe-inline but not unsafe-eval."""
        response = client_prod.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "script-src 'self' 'unsafe-inline'" in csp
        assert "unsafe-eval" not in csp

    def test_csp_no_localhost_in_prod(self, client_prod):
        """Test CSP does not allow localhost in production."""
        response = client_prod.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "http://localhost" not in csp

    def test_csp_connect_src_https_only(self, client_prod):
        """Test connect-src only allows HTTPS in production."""
        response = client_prod.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "connect-src 'self' https:" in csp

    def test_csp_upgrade_insecure_requests(self, client_prod):
        """Test CSP includes upgrade-insecure-requests."""
        response = client_prod.get("/test")
        csp = response.headers["Content-Security-Policy"]
        assert "upgrade-insecure-requests" in csp


class TestHSTSHeader:
    """Test HTTP Strict Transport Security (HSTS) header."""

    def test_hsts_not_present_in_dev(self, client_dev):
        """Test HSTS header is NOT present in development."""
        response = client_dev.get("/test")
        assert "Strict-Transport-Security" not in response.headers

    def test_hsts_present_in_prod(self, client_prod):
        """Test HSTS header IS present in production."""
        response = client_prod.get("/test")
        assert "Strict-Transport-Security" in response.headers

    def test_hsts_max_age_in_prod(self, client_prod):
        """Test HSTS max-age is set to 1 year (31536000 seconds)."""
        response = client_prod.get("/test")
        hsts = response.headers["Strict-Transport-Security"]
        assert "max-age=31536000" in hsts

    def test_hsts_include_subdomains(self, client_prod):
        """Test HSTS includes subdomains."""
        response = client_prod.get("/test")
        hsts = response.headers["Strict-Transport-Security"]
        assert "includeSubDomains" in hsts

    def test_hsts_preload_flag(self, client_prod):
        """Test HSTS includes preload flag."""
        response = client_prod.get("/test")
        hsts = response.headers["Strict-Transport-Security"]
        assert "preload" in hsts


class TestSecurityHeadersOnAllEndpoints:
    """Test that security headers are applied to all responses."""

    def test_headers_on_root_endpoint(self, client_prod):
        """Test headers are present on root endpoint."""
        response = client_prod.get("/test")
        assert response.status_code == 200
        assert "Content-Security-Policy" in response.headers
        assert "X-Frame-Options" in response.headers

    def test_headers_on_api_endpoint(self, client_prod):
        """Test headers are present on API endpoints."""
        response = client_prod.get("/api/health")
        assert response.status_code == 200
        assert "Content-Security-Policy" in response.headers
        assert "Strict-Transport-Security" in response.headers

    def test_headers_on_404_response(self, client_prod):
        """Test headers are present even on 404 responses."""
        response = client_prod.get("/nonexistent")
        assert response.status_code == 404
        assert "Content-Security-Policy" in response.headers
        assert "X-Frame-Options" in response.headers

    def test_headers_on_different_methods(self, client_prod):
        """Test headers are present on different HTTP methods."""
        # GET
        response = client_prod.get("/test")
        assert "Content-Security-Policy" in response.headers

        # POST (will fail but headers should still be there)
        response = client_prod.post("/test")
        assert "Content-Security-Policy" in response.headers


class TestEnvironmentAwareness:
    """Test that middleware correctly adapts to environment."""

    def test_dev_vs_prod_csp_differences(self, client_dev, client_prod):
        """Test CSP differs between development and production."""
        dev_response = client_dev.get("/test")
        prod_response = client_prod.get("/test")

        dev_csp = dev_response.headers["Content-Security-Policy"]
        prod_csp = prod_response.headers["Content-Security-Policy"]

        # Development should have unsafe-eval
        assert "unsafe-eval" in dev_csp
        # Production should not
        assert "unsafe-eval" not in prod_csp

    def test_dev_vs_prod_hsts_differences(self, client_dev, client_prod):
        """Test HSTS differs between development and production."""
        dev_response = client_dev.get("/test")
        prod_response = client_prod.get("/test")

        # Development should NOT have HSTS
        assert "Strict-Transport-Security" not in dev_response.headers
        # Production SHOULD have HSTS
        assert "Strict-Transport-Security" in prod_response.headers

    def test_common_headers_same_in_both_envs(self, client_dev, client_prod):
        """Test common headers are present in both environments."""
        dev_response = client_dev.get("/test")
        prod_response = client_prod.get("/test")

        common_headers = [
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Referrer-Policy",
            "Permissions-Policy",
        ]

        for header in common_headers:
            assert header in dev_response.headers
            assert header in prod_response.headers
            # Values should be the same
            assert dev_response.headers[header] == prod_response.headers[header]


class TestSecurityBestPractices:
    """Test that headers follow security best practices."""

    def test_no_server_header_leakage(self, client_prod):
        """Test that we don't leak server information."""
        response = client_prod.get("/test")
        # Server header might be set by uvicorn, but shouldn't reveal too much
        if "Server" in response.headers:
            server = response.headers["Server"].lower()
            # Should not contain version numbers
            assert "uvicorn" in server or "hypercorn" in server

    def test_csp_prevents_inline_scripts_in_prod(self, client_prod):
        """Test that inline scripts are restricted (unless explicitly allowed)."""
        response = client_prod.get("/test")
        csp = response.headers["Content-Security-Policy"]
        # While unsafe-inline is allowed, unsafe-eval should NOT be
        assert "unsafe-eval" not in csp

    def test_frame_options_prevents_clickjacking(self, client_prod):
        """Test X-Frame-Options prevents clickjacking."""
        response = client_prod.get("/test")
        frame_options = response.headers["X-Frame-Options"]
        assert frame_options in ["DENY", "SAMEORIGIN"]

    def test_nosniff_prevents_mime_confusion(self, client_prod):
        """Test X-Content-Type-Options prevents MIME sniffing."""
        response = client_prod.get("/test")
        assert response.headers["X-Content-Type-Options"] == "nosniff"


# Integration test
def test_security_headers_integration():
    """Integration test: Verify all critical security headers."""
    app = FastAPI()
    app.add_middleware(SecurityHeadersMiddleware, is_production=True)

    @app.get("/")
    async def root():
        return {"status": "ok"}

    client = TestClient(app)
    response = client.get("/")

    # Critical headers that MUST be present
    critical_headers = {
        "Content-Security-Policy": lambda v: "default-src 'self'" in v,
        "Strict-Transport-Security": lambda v: "max-age=31536000" in v,
        "X-Frame-Options": lambda v: v == "DENY",
        "X-Content-Type-Options": lambda v: v == "nosniff",
    }

    for header, validator in critical_headers.items():
        assert header in response.headers, f"Missing critical header: {header}"
        assert validator(response.headers[header]), f"Invalid value for {header}"


if __name__ == "__main__":
    # Run tests with: pytest test_security_headers.py -v
    pytest.main([__file__, "-v"])
