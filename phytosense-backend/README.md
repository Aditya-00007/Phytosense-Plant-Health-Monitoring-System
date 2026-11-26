# PhytoSense AI Backend (Python / FastAPI)

Separate Python AI backend for the `phytosense-app` React Native (Expo) frontend.
Currently implements **Phase 1: Plant Diagnosis (`POST /predict`)**; see [PLAN.md](./PLAN.md) for the full multi-phase roadmap.

## Setup & Run

```bash
cd phytosense-backend
python -m venv .venv
.venv\Scripts\activate      # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Interactive Swagger docs: `http://localhost:8000/docs`
- Health check: `GET http://localhost:8000/health`
- Plant diagnosis: `POST http://localhost:8000/predict` (`image`, `crop`, `lat`, `lon`)

## Optional AI Configuration

Copy `.env.example` to `.env`:
- `GROQ_API_KEY`: enriches diagnosis explanations/treatment/irrigation advice via Groq LLM.
- `MODEL_PATH`: path to a trained `.onnx` plant disease classifier (falls back to the built-in leaf-color baseline if unset).

## Run Tests

```bash
pytest
```
