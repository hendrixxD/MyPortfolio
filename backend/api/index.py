"""
Vercel serverless function entry point.
"""
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app

# Vercel expects the ASGI app to be named 'app'
__all__ = ['app']
