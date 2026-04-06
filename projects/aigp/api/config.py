"""App config from environment variables."""
import os

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "AIGP Flight Manager")
    APP_VERSION: str = os.getenv("APP_VERSION", "0.2.0")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./aigp_runs.db")
    RACE_LOG_DIR: str = os.getenv("RACE_LOG_DIR", ".")

settings = Settings()
