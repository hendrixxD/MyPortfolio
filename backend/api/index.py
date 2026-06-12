"""
Vercel serverless function entry point.
"""
from app.main import app

# Vercel expects the ASGI app to be named 'app'
__all__ = ['app']
