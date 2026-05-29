from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database components — MUST be set via environment variables, no defaults for security
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str = "portfolio"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

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

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
