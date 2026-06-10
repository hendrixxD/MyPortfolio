import os
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env" if os.path.exists(".env") else None,
        extra="allow"
    )

    # Environment detection
    ENVIRONMENT: str = Field(default="development")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_vercel(self) -> bool:
        """Detect if running on Vercel serverless."""
        return os.getenv("VERCEL") == "1"

    @property
    def is_docker(self) -> bool:
        """Detect if running in Docker container."""
        return os.path.exists("/.dockerenv")

    # Database - two modes: direct URL (Vercel/Neon) or component-based (Docker)
    database_url_direct: str = Field(default="", alias="DATABASE_URL")

    DB_HOST: Optional[str] = None
    DB_PORT: int = 5432
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_NAME: str = "portfolio"

    @property
    def DATABASE_URL(self) -> str:
        # Priority 1: Direct URL (Vercel/Neon/Cloud SQL)
        if self.database_url_direct:
            return self.database_url_direct

        # Priority 2: Component-based (Docker)
        if self.DB_USER and self.DB_PASSWORD and self.DB_HOST:
            return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

        # Fallback for development only
        if self.is_development:
            return f"postgresql://postgres:postgres@localhost:5432/{self.DB_NAME}"

        raise ValueError(
            "DATABASE_URL is required in production. "
            "Use deployment.py to configure environment."
        )

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS - no defaults, must be explicitly set
    CORS_ORIGINS: str = Field(default="")

    @field_validator("CORS_ORIGINS")
    @classmethod
    def validate_cors_origins(cls, v: str, info) -> str:
        env = info.data.get("ENVIRONMENT", "development")

        # Allow empty in development
        if not v and env == "development":
            return "http://localhost:3000"

        if env == "production":
            # Validate no localhost in production
            if any(x in v.lower() for x in ["localhost", "127.0.0.1"]):
                raise ValueError(
                    "CORS_ORIGINS cannot contain localhost in production. "
                    "Use deployment.py to configure."
                )

        return v

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024

    ALLOWED_EXTENSIONS: List[str] = [
        "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "tif",
        "ico", "heic", "heif", "avif",
        "mp4", "webm", "mov", "avi", "mkv", "flv", "wmv", "m4v", "mpeg", "mpg"
    ]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Redis (optional - only for Docker)
    REDIS_HOST: Optional[str] = None
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None

    @property
    def redis_url(self) -> Optional[str]:
        """Get Redis URL if configured, else None."""
        if self.REDIS_HOST:
            if self.REDIS_PASSWORD:
                return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/0"
            return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        return None

    @property
    def has_redis(self) -> bool:
        return self.redis_url is not None

    # Site Info
    SITE_NAME: str = Field(default="lengedandungjoshua")
    SITE_DESCRIPTION: str = Field(default="Data Engineer & Chemical/Petroleum Technology Portfolio")
    SITE_URL: str = Field(default="")

    @field_validator("SITE_URL")
    @classmethod
    def validate_site_url(cls, v: str, info) -> str:
        env = info.data.get("ENVIRONMENT", "development")

        # Allow empty in development
        if not v and env == "development":
            return "http://localhost:3000"

        if env == "production":
            if any(x in v.lower() for x in ["localhost", "127.0.0.1"]):
                raise ValueError(
                    "SITE_URL cannot contain localhost in production. "
                    "Use deployment.py to configure."
                )
            if not v.startswith("https://"):
                raise ValueError(
                    "SITE_URL must use HTTPS in production."
                )

        return v

    # Admin User
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    # Sentry
    SENTRY_DSN: str = ""
    SENTRY_ENVIRONMENT: str = "production"
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1
    SENTRY_PROFILES_SAMPLE_RATE: float = 0.1

    # Cloudflare R2
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = ""
    R2_PUBLIC_URL: str = Field(default="https://uploads.heistats.com")

    @field_validator("R2_PUBLIC_URL")
    @classmethod
    def validate_r2_url(cls, v: str) -> str:
        if not v:
            raise ValueError("R2_PUBLIC_URL must be set")
        if not v.startswith("https://"):
            raise ValueError("R2_PUBLIC_URL must use HTTPS")
        return v


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
