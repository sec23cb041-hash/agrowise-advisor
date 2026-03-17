import asyncio
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import disease, soil, crop_recommend, weather_ai, voice_advisory
from services.model_loader import load_models


def _load_models_background():
    """Load models in a background thread so the server binds the port immediately."""
    try:
        load_models()
    except Exception as e:
        print(f"[startup] Model loading error (non-fatal): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start model loading in background — server is ready to accept requests immediately
    t = threading.Thread(target=_load_models_background, daemon=True)
    t.start()
    yield


app = FastAPI(title="TechTrack ML Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(disease.router)
app.include_router(soil.router)
app.include_router(crop_recommend.router)
app.include_router(weather_ai.router)
app.include_router(voice_advisory.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
