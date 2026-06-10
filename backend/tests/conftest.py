"""
Pytest configuration for backend tests.
"""
import os
import sys
import pytest
from unittest.mock import patch
from functools import lru_cache


# Temporarily rename .env file during tests to prevent loading
_original_env_path = None


def pytest_configure(config):
    """Called before test collection."""
    global _original_env_path
    backend_dir = os.path.dirname(os.path.dirname(__file__))
    env_file = os.path.join(backend_dir, '.env')

    # Set minimal env vars needed for module import
    os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-pytest')
    os.environ.setdefault('ADMIN_EMAIL', 'test@pytest.local')
    os.environ.setdefault('ADMIN_PASSWORD', 'test-password-for-pytest')

    if os.path.exists(env_file):
        _original_env_path = env_file
        temp_path = env_file + '.pytest_backup'
        if not os.path.exists(temp_path):
            os.rename(env_file, temp_path)


def pytest_unconfigure(config):
    """Called after test session finishes."""
    global _original_env_path
    if _original_env_path:
        backend_dir = os.path.dirname(os.path.dirname(__file__))
        env_file = os.path.join(backend_dir, '.env')
        temp_path = env_file + '.pytest_backup'

        if os.path.exists(temp_path) and not os.path.exists(env_file):
            os.rename(temp_path, env_file)


@pytest.fixture(autouse=True)
def isolate_environment(monkeypatch):
    """
    Automatically isolate environment for all tests.
    Clears env vars that could leak from .env files.
    """
    # List of all config variables to clear
    config_vars = [
        "DATABASE_URL",
        "DB_HOST",
        "DB_PORT",
        "DB_USER",
        "DB_PASSWORD",
        "DB_NAME",
        "ENVIRONMENT",
        "SECRET_KEY",
        "CORS_ORIGINS",
        "SITE_URL",
        "REDIS_HOST",
        "REDIS_PORT",
        "REDIS_PASSWORD",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",
        "VERCEL",
        "DOCKER",
        "R2_ACCOUNT_ID",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "R2_BUCKET_NAME",
        "R2_PUBLIC_URL",
        "SENTRY_DSN",
        "SENTRY_ENVIRONMENT",
    ]

    # Clear all config variables
    for var in config_vars:
        monkeypatch.delenv(var, raising=False)

    # Clear lru_cache for get_settings to ensure fresh settings per test
    if 'app.core.config' in sys.modules:
        from app.core.config import get_settings
        get_settings.cache_clear()
