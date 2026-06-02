import os
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Only load .env file if it exists (local dev)
        # In serverless (Vercel), env vars come from platform
        env_file=".env" if os.path.exists(".env") else None,
        extra="allow"
    )

    # Database - supports two modes:
    # 1. Direct DATABASE_URL (Neon/Vercel - preferred)
    # 2. Component-based (legacy Aiven - fallback for local dev)
    database_url_direct: str = Field(default="", alias="DATABASE_URL")

    # Legacy database components (optional, for backward compatibility)
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = ""
    DB_PASSWORD: str = ""
    DB_NAME: str = "portfolio"

    @property
    def DATABASE_URL(self) -> str:
        # If DATABASE_URL is set directly (Neon/Vercel), use it
        if self.database_url_direct:
            return self.database_url_direct
        # Otherwise, construct from components (legacy Aiven)
        if self.DB_USER and self.DB_PASSWORD:
            return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        raise ValueError("DATABASE_URL or DB_USER+DB_PASSWORD must be set")

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,https://ldj.heistats.com,https://mybackendapi-six.vercel.app"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB (for videos)

    # Allowed file extensions (images + videos)
    ALLOWED_EXTENSIONS: List[str] = [
        # Images
        "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "tif",
        "ico", "heic", "heif", "avif",
        # Videos
        "mp4", "webm", "mov", "avi", "mkv", "flv", "wmv", "m4v", "mpeg", "mpg"
    ]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Site Info
    SITE_NAME: str = "lengedandungjoshua"
    SITE_DESCRIPTION: str = "Data Engineer & Chemical/Petroleum Technology Portfolio"
    SITE_URL: str = "http://localhost:3000"

    # Admin User (for seeding)
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    # Sentry Configuration
    SENTRY_DSN: str = ""
    SENTRY_ENVIRONMENT: str = "production"
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1  # 10% of requests for APM
    SENTRY_PROFILES_SAMPLE_RATE: float = 0.1

    # Cloudflare R2 Storage
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = ""
    R2_PUBLIC_URL: str = "https://uploads.heistats.com"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
