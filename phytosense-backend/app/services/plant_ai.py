import io
import json
from typing import Optional

import httpx
import numpy as np
from PIL import Image

from app.core.config import GROQ_API_KEY, MODEL_PATH
from app.schemas.plant import DiagnosisResponse

# Knowledge base keyed by disease label; mirrors the structure expected by Diagnosis.js.
DISEASE_KB: dict[str, dict] = {
    "Healthy": {
        "explanation": "Leaf tissue shows uniform healthy chlorophyll coloration without significant necrotic or chlorotic lesions.",
        "causes": ["Balanced nutrition and adequate moisture"],
        "treatment": ["No chemical treatment required", "Continue routine field scouting"],
        "prevention": ["Maintain proper plant spacing", "Keep tools sanitized"],
        "irrigation": ["Maintain regular watering schedule at root zone", "Avoid waterlogging"],
    },
    "Early Blight": {
        "explanation": "Dark brown lesions with concentric rings and yellow halos, typically caused by Alternaria fungi in warm, humid weather.",
        "causes": ["Warm temperatures (20-30°C)", "High humidity or leaf wetness", "Overhead irrigation"],
        "treatment": ["Remove severely infected lower leaves", "Apply Mancozeb or Chlorothalonil fungicide per label dosage"],
        "prevention": ["Rotate crops away from Solanaceae for 2-3 years", "Use disease-free seed or resistant varieties"],
        "irrigation": ["Water at the base of plants early in the day", "Avoid wetting foliage"],
    },
    "Late Blight": {
        "explanation": "Water-soaked dark green to brown blotches on leaves that spread rapidly in cool, wet conditions.",
        "causes": ["Phytophthora infestans pathogen", "Prolonged leaf wetness and high humidity"],
        "treatment": ["Prune and destroy infected foliage immediately", "Apply copper-based or systemic blight fungicide"],
        "prevention": ["Ensure good air circulation and row spacing", "Avoid planting near volunteer potato/tomato plants"],
        "irrigation": ["Switch to drip irrigation if possible", "Irrigate in the morning so foliage dries quickly"],
    },
    "Powdery Mildew": {
        "explanation": "White powdery fungal growth on leaf surfaces, reducing photosynthesis and leaf vigor.",
        "causes": ["High relative humidity with dry leaf surfaces", "Dense canopy with poor airflow"],
        "treatment": ["Apply wettable sulfur or potassium bicarbonate spray", "Use neem oil as an organic option"],
        "prevention": ["Prune dense foliage to improve airflow", "Avoid excess nitrogen fertilization"],
        "irrigation": ["Maintain steady soil moisture to avoid plant stress", "Irrigate at root level"],
    },
    "Leaf Spot": {
        "explanation": "Circular brown or tan spots across the leaf blade, indicating fungal or bacterial leaf spot infection.",
        "causes": ["Splashing rain or overhead watering", "Fungal/bacterial spores surviving on crop residue"],
        "treatment": ["Remove affected leaves from the field", "Apply copper oxychloride or broad-spectrum fungicide"],
        "prevention": ["Clear infected crop debris after harvest", "Mulch soil to prevent spore splash"],
        "irrigation": ["Use drip or furrow irrigation instead of sprinklers", "Avoid working in wet fields"],
    },
}


def _preprocess_rgb(image_bytes: bytes) -> np.ndarray:
    """Validate and resize uploaded image bytes into a normalized (224, 224, 3) float32 array."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        rgb = img.convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
        return np.asarray(rgb, dtype=np.float32) / 255.0


def _heuristic_classify(arr: np.ndarray) -> tuple[str, float]:
    """
    Lightweight color/lesion baseline classifier used when no ONNX/PyTorch weights are loaded.
    Inspects greenness vs yellow/brown/pale pixel ratios across the 224x224 leaf sample.
    """
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    healthy_green = float(np.mean((g > r * 1.08) & (g > b * 1.12) & (g > 0.25)))
    yellow_halo = float(np.mean((r > 0.45) & (g > 0.40) & (b < 0.35) & (np.abs(r - g) < 0.18)))
    brown_necrosis = float(np.mean((r > g * 1.05) & (r > b * 1.15) & (r < 0.65) & (g < 0.50)))
    pale_mildew = float(np.mean((r > 0.70) & (g > 0.70) & (b > 0.65)))

    if healthy_green >= 0.45 and brown_necrosis < 0.12 and yellow_halo < 0.15:
        return "Healthy", round(min(0.96, 0.72 + healthy_green * 0.25), 2)
    if pale_mildew >= 0.28:
        return "Powdery Mildew", round(min(0.92, 0.65 + pale_mildew * 0.4), 2)
    if brown_necrosis >= 0.22 and yellow_halo >= 0.12:
        return "Early Blight", round(min(0.94, 0.68 + brown_necrosis * 0.4), 2)
    if brown_necrosis >= 0.28:
        return "Late Blight", round(min(0.91, 0.64 + brown_necrosis * 0.4), 2)
    if yellow_halo >= 0.14 or brown_necrosis >= 0.10:
        return "Leaf Spot", round(min(0.89, 0.62 + (yellow_halo + brown_necrosis) * 0.4), 2)
    return "Early Blight", 0.65


def _run_model(arr: np.ndarray) -> tuple[str, float]:
    """Run ONNX model if configured and available; otherwise use the baseline vision heuristic."""
    if MODEL_PATH:
        try:
            import onnxruntime as ort  # optional runtime when a model file is provided

            session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
            input_name = session.get_inputs()[0].name
            nchw = np.transpose(arr, (2, 0, 1))[None, ...].astype(np.float32)
            logits = session.run(None, {input_name: nchw})[0][0]
            probs = np.exp(logits - np.max(logits))
            probs = probs / np.sum(probs)
            labels = list(DISEASE_KB.keys())
            idx = int(np.argmax(probs))
            label = labels[idx] if idx < len(labels) else f"Class_{idx}"
            return label, round(float(probs[idx]), 2)
        except Exception:
            pass
    return _heuristic_classify(arr)


async def _enrich_with_groq(
    disease: str,
    crop: str,
    confidence: float,
    lat: Optional[float],
    lon: Optional[float],
) -> Optional[dict]:
    """Optionally enrich explanation & actionable advice via Groq when GROQ_API_KEY is set."""
    if not GROQ_API_KEY:
        return None

    loc_note = f" at coordinates ({lat:.3f}, {lon:.3f})" if lat is not None and lon is not None else ""
    prompt = (
        f"Plant diagnosis: crop={crop}, detected={disease} (confidence={confidence:.0%}){loc_note}. "
        "Return strict JSON with keys: explanation (string), causes (list of 2-3 short strings), "
        "treatment (list of 2-3 short strings), prevention (list of 2-3 short strings), "
        "irrigation (list of 2-3 short strings)."
    )
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are an agronomist. Reply with valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            if isinstance(parsed, dict) and parsed.get("explanation"):
                return parsed
    except Exception:
        return None
    return None


async def diagnose_plant(
    image_bytes: bytes,
    crop: str = "Tomato",
    lat: Optional[float] = None,
    lon: Optional[float] = None,
) -> DiagnosisResponse:
    arr = _preprocess_rgb(image_bytes)
    disease, confidence = _run_model(arr)

    kb = DISEASE_KB.get(disease, DISEASE_KB["Leaf Spot"])
    enriched = await _enrich_with_groq(disease, crop, confidence, lat, lon)
    source = enriched or kb

    return DiagnosisResponse(
        disease=disease,
        crop=crop or "Tomato",
        confidence=confidence,
        explanation=str(source.get("explanation") or kb["explanation"]),
        causes=list(source.get("causes") or kb["causes"]),
        treatment=list(source.get("treatment") or kb["treatment"]),
        prevention=list(source.get("prevention") or kb["prevention"]),
        irrigation=list(source.get("irrigation") or kb["irrigation"]),
    )
