import asyncio
import io
import httpx
from PIL import Image

from app.main import app


def _make_png(color=(40, 160, 50)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), color).save(buf, format="PNG")
    return buf.getvalue()


def _request(method: str, path: str, **kwargs):
    async def _run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.request(method, path, **kwargs)

    return asyncio.run(_run())


def test_health():
    res = _request("GET", "/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_predict_plant_valid_image():
    res = _request(
        "POST",
        "/predict",
        files={"image": ("leaf.png", _make_png(), "image/png")},
        data={"crop": "Tomato", "lat": "18.52", "lon": "73.85"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["crop"] == "Tomato"
    assert 0.0 <= body["confidence"] <= 1.0
    assert body["disease"]
    assert isinstance(body["causes"], list) and len(body["causes"]) > 0
    assert isinstance(body["treatment"], list) and len(body["treatment"]) > 0


def test_predict_rejects_non_image():
    res = _request(
        "POST",
        "/predict",
        files={"image": ("notes.txt", b"not an image", "text/plain")},
        data={"crop": "Tomato"},
    )
    assert res.status_code == 400
    assert "detail" in res.json()
