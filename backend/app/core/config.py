import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-CityTwin"
    PROJECT_TITLE: str = "AI-CityTwin: An AI-Powered Digital Twin Framework for Predictive Urban Intelligence and What-If Decision Simulation"
    TAGLINE: str = "Observe. Predict. Simulate. Decide."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ai-citytwin-super-secret-production-jwt-key-2026-btech-cse")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ai_citytwin.db")
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"]
    
    # Telemetry simulation interval in seconds
    TELEMETRY_INTERVAL_SECONDS: int = 5
    
    # Demo flag
    IS_DEMO_MODE: bool = True
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
