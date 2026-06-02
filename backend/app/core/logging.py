"""
Logging configuration using loguru.

Configured for serverless environments (Vercel):
- Logs to stdout only (captured by Vercel's log aggregation)
- No file handlers (ephemeral filesystem)
"""
import sys
from loguru import logger

# Remove default handler
logger.remove()

# Add console handler with custom format
# In serverless environments, stdout is captured and persisted automatically
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO",
)


def get_logger():
    """Get the configured logger instance."""
    return logger
