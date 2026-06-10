"""
Configuration Breaking Changes Validation Tests.

Tests all configuration scenarios to ensure no regressions:
- Frontend getApiUrl() logic (4 priority levels)
- Backend DATABASE_URL construction (3 modes)
- CORS validation (production restrictions)
- Redis optional fallback
"""
import os
import pytest
from unittest.mock import patch, MagicMock
from pydantic import ValidationError

from app.core.config import Settings, get_settings


# Helper to clear environment completely for isolated tests
def clean_env(env_dict):
    """Return a clean environment with only the specified variables."""
    # Clear all potential config variables
    clean = {}
    for key in env_dict:
        clean[key] = env_dict[key]
    return clean


class TestDatabaseURLConstruction:
    """Test DATABASE_URL construction in all modes."""

    def test_priority_1_direct_url(self):
        """Priority 1: Direct DATABASE_URL (Vercel/Neon)."""
        with patch.dict(os.environ, {
            "DATABASE_URL": "postgresql://user:pass@neon.cloud/db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }):
            settings = Settings()
            assert settings.DATABASE_URL == "postgresql://user:pass@neon.cloud/db"

    def test_priority_2_component_based(self):
        """Priority 2: Component-based (Docker)."""
        env = clean_env({
            "DB_HOST": "postgres",
            "DB_PORT": "5432",
            "DB_USER": "portfolio_user",
            "DB_PASSWORD": "portfolio_pass",
            "DB_NAME": "portfolio_db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        })
        with patch.dict(os.environ, env, clear=True):
            settings = Settings()
            expected = "postgresql://portfolio_user:portfolio_pass@postgres:5432/portfolio_db"
            assert settings.DATABASE_URL == expected

    def test_priority_3_development_fallback(self):
        """Priority 3: Development fallback."""
        env = clean_env({
            "ENVIRONMENT": "development",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        })
        with patch.dict(os.environ, env, clear=True):
            settings = Settings()
            assert settings.DATABASE_URL == "postgresql://postgres:postgres@localhost:5432/portfolio"

    def test_production_requires_database_url(self):
        """Production must have DATABASE_URL configured."""
        env = clean_env({
            "ENVIRONMENT": "production",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass",
            "CORS_ORIGINS": "https://example.com",
            "SITE_URL": "https://example.com"
        })
        with patch.dict(os.environ, env, clear=True):
            settings = Settings()
            with pytest.raises(ValueError, match="DATABASE_URL is required in production"):
                _ = settings.DATABASE_URL

    def test_component_based_custom_port(self):
        """Component-based with custom port."""
        env = clean_env({
            "DB_HOST": "postgres",
            "DB_PORT": "5433",
            "DB_USER": "custom_user",
            "DB_PASSWORD": "custom_pass",
            "DB_NAME": "custom_db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        })
        with patch.dict(os.environ, env, clear=True):
            settings = Settings()
            expected = "postgresql://custom_user:custom_pass@postgres:5433/custom_db"
            assert settings.DATABASE_URL == expected


class TestCORSValidation:
    """Test CORS origin validation."""

    def test_development_allows_empty_cors(self):
        """Development allows empty CORS (defaults to localhost)."""
        env = clean_env({
            "ENVIRONMENT": "development",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        })
        with patch.dict(os.environ, env, clear=True):
            settings = Settings()
            assert settings.CORS_ORIGINS == "http://localhost:3000"
            assert settings.cors_origins_list == ["http://localhost:3000"]

    def test_production_rejects_localhost(self):
        """Production rejects localhost in CORS."""
        with patch.dict(os.environ, {
            "ENVIRONMENT": "production",
            "CORS_ORIGINS": "http://localhost:3000,https://example.com",
            "DATABASE_URL": "postgresql://user:pass@host/db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            assert "CORS_ORIGINS cannot contain localhost in production" in str(exc_info.value)

    def test_production_accepts_valid_origins(self):
        """Production accepts valid HTTPS origins."""
        with patch.dict(os.environ, {
            "ENVIRONMENT": "production",
            "CORS_ORIGINS": "https://example.com,https://app.example.com",
            "DATABASE_URL": "postgresql://user:pass@host/db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass",
            "SITE_URL": "https://example.com"
        }, clear=True):
            settings = Settings()
            assert len(settings.cors_origins_list) == 2
            assert "https://example.com" in settings.cors_origins_list
            assert "https://app.example.com" in settings.cors_origins_list

    def test_production_rejects_127_0_0_1(self):
        """Production rejects 127.0.0.1 in CORS."""
        with patch.dict(os.environ, {
            "ENVIRONMENT": "production",
            "CORS_ORIGINS": "http://127.0.0.1:3000",
            "DATABASE_URL": "postgresql://user:pass@host/db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            assert "CORS_ORIGINS cannot contain localhost in production" in str(exc_info.value)


class TestRedisOptionalFallback:
    """Test Redis optional fallback behavior."""

    def test_redis_url_with_password(self):
        """Redis URL with password."""
        with patch.dict(os.environ, {
            "REDIS_HOST": "redis",
            "REDIS_PORT": "6379",
            "REDIS_PASSWORD": "redis-secret",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.redis_url == "redis://:redis-secret@redis:6379/0"
            assert settings.has_redis is True

    def test_redis_url_without_password(self):
        """Redis URL without password."""
        with patch.dict(os.environ, {
            "REDIS_HOST": "redis",
            "REDIS_PORT": "6379",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.redis_url == "redis://redis:6379/0"
            assert settings.has_redis is True

    def test_redis_not_configured(self):
        """Redis not configured returns None."""
        with patch.dict(os.environ, {
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.redis_url is None
            assert settings.has_redis is False

    def test_redis_custom_port(self):
        """Redis with custom port."""
        with patch.dict(os.environ, {
            "REDIS_HOST": "redis",
            "REDIS_PORT": "6380",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.redis_url == "redis://redis:6380/0"


class TestEnvironmentDetection:
    """Test environment detection helpers."""

    def test_is_production(self):
        """Test is_production property."""
        env = clean_env({
            "ENVIRONMENT": "production",
            "DATABASE_URL": "postgresql://user:pass@host/db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass",
            "SITE_URL": "https://example.com",
            "CORS_ORIGINS": "https://example.com"
        })
        with patch.dict(os.environ, env, clear=True):
            settings = Settings()
            assert settings.is_production is True
            assert settings.is_development is False

    def test_is_development(self):
        """Test is_development property."""
        with patch.dict(os.environ, {
            "ENVIRONMENT": "development",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.is_development is True
            assert settings.is_production is False

    def test_is_vercel(self):
        """Test is_vercel property."""
        with patch.dict(os.environ, {
            "VERCEL": "1",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.is_vercel is True

    @patch('os.path.exists')
    def test_is_docker(self, mock_exists):
        """Test is_docker property."""
        mock_exists.return_value = True
        with patch.dict(os.environ, {
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.is_docker is True


class TestSiteURLValidation:
    """Test SITE_URL validation."""

    def test_development_allows_empty_site_url(self):
        """Development allows empty SITE_URL (defaults to localhost)."""
        with patch.dict(os.environ, {
            "ENVIRONMENT": "development",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.SITE_URL == "http://localhost:3000"

    def test_production_requires_https(self):
        """Production requires HTTPS for SITE_URL."""
        with patch.dict(os.environ, {
            "ENVIRONMENT": "production",
            "SITE_URL": "http://example.com",
            "DATABASE_URL": "postgresql://user:pass@host/db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            assert "SITE_URL must use HTTPS in production" in str(exc_info.value)

    def test_production_rejects_localhost_site_url(self):
        """Production rejects localhost in SITE_URL."""
        with patch.dict(os.environ, {
            "ENVIRONMENT": "production",
            "SITE_URL": "https://localhost:3000",
            "DATABASE_URL": "postgresql://user:pass@host/db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            assert "SITE_URL cannot contain localhost in production" in str(exc_info.value)

    def test_production_accepts_valid_https_url(self):
        """Production accepts valid HTTPS URL."""
        with patch.dict(os.environ, {
            "ENVIRONMENT": "production",
            "SITE_URL": "https://example.com",
            "DATABASE_URL": "postgresql://user:pass@host/db",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass",
            "CORS_ORIGINS": "https://example.com"
        }, clear=True):
            settings = Settings()
            assert settings.SITE_URL == "https://example.com"


class TestR2Configuration:
    """Test Cloudflare R2 configuration."""

    def test_r2_public_url_requires_https(self):
        """R2_PUBLIC_URL must use HTTPS."""
        with patch.dict(os.environ, {
            "R2_PUBLIC_URL": "http://uploads.example.com",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            assert "R2_PUBLIC_URL must use HTTPS" in str(exc_info.value)

    def test_r2_public_url_defaults_correctly(self):
        """R2_PUBLIC_URL has correct default."""
        with patch.dict(os.environ, {
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.R2_PUBLIC_URL == "https://uploads.heistats.com"

    def test_r2_public_url_accepts_valid_https(self):
        """R2_PUBLIC_URL accepts valid HTTPS URL."""
        with patch.dict(os.environ, {
            "R2_PUBLIC_URL": "https://custom-uploads.example.com",
            "SECRET_KEY": "test-secret",
            "ADMIN_EMAIL": "admin@test.com",
            "ADMIN_PASSWORD": "test-pass"
        }, clear=True):
            settings = Settings()
            assert settings.R2_PUBLIC_URL == "https://custom-uploads.example.com"


class TestConfigurationIntegration:
    """Test full configuration integration scenarios."""

    def test_vercel_production_deployment(self):
        """Test typical Vercel production configuration."""
        with patch.dict(os.environ, {
            "VERCEL": "1",
            "ENVIRONMENT": "production",
            "DATABASE_URL": "postgresql://user:pass@vercel-postgres.com/db",
            "CORS_ORIGINS": "https://example.com",
            "SITE_URL": "https://example.com",
            "SECRET_KEY": "prod-secret",
            "ADMIN_EMAIL": "admin@example.com",
            "ADMIN_PASSWORD": "secure-pass"
        }, clear=True):
            settings = Settings()
            assert settings.is_vercel is True
            assert settings.is_production is True
            assert settings.DATABASE_URL == "postgresql://user:pass@vercel-postgres.com/db"
            assert settings.has_redis is False

    @patch('os.path.exists')
    def test_docker_deployment(self, mock_exists):
        """Test typical Docker deployment configuration."""
        mock_exists.return_value = True
        env = clean_env({
            "ENVIRONMENT": "production",
            "DB_HOST": "postgres",
            "DB_USER": "portfolio_user",
            "DB_PASSWORD": "portfolio_pass",
            "DB_NAME": "portfolio_db",
            "REDIS_HOST": "redis",
            "REDIS_PASSWORD": "redis-pass",
            "CORS_ORIGINS": "https://example.com",
            "SITE_URL": "https://example.com",
            "SECRET_KEY": "prod-secret",
            "ADMIN_EMAIL": "admin@example.com",
            "ADMIN_PASSWORD": "secure-pass"
        })
        with patch.dict(os.environ, env, clear=True):
            settings = Settings()
            assert settings.is_docker is True
            assert settings.is_production is True
            assert "portfolio_user:portfolio_pass@postgres" in settings.DATABASE_URL
            assert settings.has_redis is True

    def test_local_development_configuration(self):
        """Test typical local development configuration."""
        env = clean_env({
            "ENVIRONMENT": "development",
            "SECRET_KEY": "dev-secret",
            "ADMIN_EMAIL": "admin@dev.local",
            "ADMIN_PASSWORD": "dev-pass"
        })
        with patch.dict(os.environ, env, clear=True):
            settings = Settings()
            assert settings.is_development is True
            assert settings.DATABASE_URL == "postgresql://postgres:postgres@localhost:5432/portfolio"
            assert settings.CORS_ORIGINS == "http://localhost:3000"
            assert settings.SITE_URL == "http://localhost:3000"
