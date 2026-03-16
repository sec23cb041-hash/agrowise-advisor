from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import disease, soil, crop_recommend, weather_ai, voice_advisory
from services.model_loader import load_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
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
