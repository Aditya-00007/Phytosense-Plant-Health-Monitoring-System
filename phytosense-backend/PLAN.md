# PhytoSense AI Backend Plan

## Recommended Framework: FastAPI (Python)

**Why FastAPI is the best fit for the current React Native (Expo) setup:**
1. **Exact API & error contract match**: `src/services/api.js` checks `data?.detail || data?.message` on non-2xx responses — FastAPI's `HTTPException` natively returns `{ "detail": "..." }`.
2. **Multipart image uploads out of the box**: `src/services/plantService.js` sends `POST /predict` as `multipart/form-data` (`image`, `crop`, `lat`, `lon`). FastAPI handles `UploadFile` + `Form(...)` cleanly for both native (`{ uri, name, type }`) and web (`Blob`).
3. **Direct Python AI/ML execution**: Runs Pillow, NumPy, PyTorch / ONNX Runtime, OpenCV, and LLM SDKs (`groq`, `google-genai`, `openai`) in the same process without Node-to-Python bridges.
4. **Expo Web + Mobile CORS**: Built-in `CORSMiddleware` works seamlessly with Expo Web (`localhost:8081`) and production domains.
5. **Fast cloud deployment**: Runs directly on Render (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`) matching `API_BASE_URL` in `src/config/env.js`.

---

## Phased Implementation Roadmap

### Phase 1 — Plant Diagnosis AI (Implemented first in `phytosense-backend/`)
- **Endpoint**: `POST /predict` (`multipart/form-data`: `image`, `crop`, `lat`, `lon`) + `GET /health`
- **Response schema** (matches `src/models/Diagnosis.js`):
  `{ disease, crop, confidence, explanation, causes, treatment, prevention, irrigation }`
- **AI Pipeline**:
  1. Image validation & preprocessing (`Pillow` RGB normalization, 224x224 tensor/feature extraction).
  2. Model inference layer:
     - Pluggable ONNX / PyTorch plant disease classifier (`MODEL_PATH` env var).
     - Color/lesion heuristic fallback when no trained model weights are configured yet (so the endpoint works immediately in development).
  3. Advisory layer:
     - Curated crop/disease knowledge base (`Early Blight`, `Late Blight`, `Leaf Spot`, `Powdery Mildew`, `Healthy`, etc.).
     - Optional Groq LLM enrichment (`GROQ_API_KEY`) to tailor treatment/irrigation advice by crop and coordinates.

### Phase 2 — Auth & Farmer Profile (`/auth/*`)
- **Endpoints**: `POST /auth/register`, `POST /auth/login`, `PUT /auth/profile`
- **Database**: SQLite (dev) / PostgreSQL (Render) via SQLAlchemy + Alembic.
- **Auth**: Password hashing (`passlib[bcrypt]`) + JWT Bearer tokens (`PyJWT`) matching `Authorization: Bearer <token>` in `src/services/api.js`.
- **Schema**: Supports all farmer profile fields in `src/models/User.js` (`farm_location`, `farm_size`, `farming_type`, `irrigation`, `Water_Availability`, `Income`, `primary_crops`, `secondary_crops`, `receive_weather_alerts`, `preferred_language`).

### Phase 3 — Weather & Regional Alerts (`/weather`, `/alerts`)
- **Endpoints**: `GET /weather?lat=&lon=`, `GET /alerts?lat=&lon=`
- **Integrations**: OpenWeatherMap / Open-Meteo proxy + Maharashtra regional risk rules (`Konkan`, `Marathwada`, `Vidarbha`, etc.).

### Phase 4 — Community Forum (`/community/posts`)
- **Endpoints**: `GET /community/posts`, `POST /community/posts`
- **Persistence**: Store farmer posts tagged by crop and author in DB.

### Phase 5 — Production & Frontend Connection
- Deploy FastAPI service to Render (or Docker).
- In `phytosense-app/src/config/env.js`, point `API_BASE_URL` to your local/deployed backend URL and set `USE_MOCK = false`.
