from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import MAX_IMAGE_BYTES
from app.schemas.plant import DiagnosisResponse
from app.services.plant_ai import diagnose_plant

router = APIRouter(tags=["plant"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}


@router.post("/predict", response_model=DiagnosisResponse)
async def predict_plant(
    image: UploadFile = File(...),
    crop: str = Form("Tomato"),
    lat: Optional[float] = Form(None),
    lon: Optional[float] = Form(None),
):
    if image.content_type and image.content_type.lower() not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type. Upload JPG, PNG, or WEBP.")

    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty.")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 10 MB limit.")

    try:
        return await diagnose_plant(data, crop=crop.strip() or "Tomato", lat=lat, lon=lon)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not process plant image: {exc}") from exc
