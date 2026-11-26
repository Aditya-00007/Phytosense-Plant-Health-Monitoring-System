import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
MODEL_PATH = os.getenv("MODEL_PATH", "").strip()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "").strip()
RAW_ORIGINS = os.getenv("CORS_ORIGINS", "*").strip()
CORS_ORIGINS = ["*"] if RAW_ORIGINS == "*" else [o.strip() for o in RAW_ORIGINS.split(",") if o.strip()]
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB
WEATHER_CACHE_TTL = 3600  # 1 hour
