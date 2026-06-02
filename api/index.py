"""
Vercel serverless function entrypoint for FastAPI.

This module is the entry point for Vercel's Python runtime.
It imports the FastAPI app and exposes it as the ASGI handler.
"""
import sys
from pathlib import Path

# Add backend directory to path so 'app' module can be imported
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_path))

# Import FastAPI app
from app.main import app

# This is the ASGI handler that Vercel calls
# Must be at module level for Vercel's builder to detect
handler = app
