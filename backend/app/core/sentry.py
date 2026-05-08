"""
Sentry integration for error tracking and APM.
"""
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.loguru import LoguruIntegration

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger()


def init_sentry():
    """Initialize Sentry for error tracking and performance monitoring."""
    if not settings.SENTRY_DSN:
        logger.info("Sentry DSN not configured, skipping Sentry initialization")
        return

    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.SENTRY_ENVIRONMENT,
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        profiles_sample_rate=settings.SENTRY_PROFILES_SAMPLE_RATE,
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            SqlalchemyIntegration(),
            RedisIntegration(),
            LoguruIntegration(),
        ],
        # Capture request data
        send_default_pii=True,
        attach_stacktrace=True,
        # Additional configuration
        before_send=before_send_handler,
        ignore_errors=[KeyboardInterrupt],
    )

    logger.info(f"Sentry initialized for environment: {settings.SENTRY_ENVIRONMENT}")


def before_send_handler(event, hint):
    """
    Process events before sending to Sentry.
    Filter out sensitive data and add additional context.
    """
    # Remove sensitive headers
    if "request" in event and "headers" in event["request"]:
        headers = event["request"]["headers"]
        sensitive_headers = ["authorization", "cookie", "x-api-key"]
        for header in sensitive_headers:
            if header in headers:
                headers[header] = "[Filtered]"

    # Add custom context
    event.setdefault("tags", {})
    event["tags"]["app"] = "portfolio-backend"

    return event
