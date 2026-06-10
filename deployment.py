#!/usr/bin/env python3
"""
Deployment orchestration for Portfolio application.

Usage:
    python deployment.py generate --target vercel --env production
    python deployment.py validate --env production
    python deployment.py deploy --target vercel --env production
    python deployment.py list-envs

This tool generates deployment configurations from centralized TOML files,
removes localhost fallbacks from source code, validates environment variables,
and supports multiple deployment targets (Vercel, Docker, Cloud Run).
"""
from deployment.cli import cli

if __name__ == '__main__':
    cli()
