from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.routers.plant import router as plant_router
from app.routers.weather import router as weather_router

app = FastAPI(title="PhytoSense AI Backend", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plant_router)
app.include_router(weather_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "phytosense-ai-backend"}
