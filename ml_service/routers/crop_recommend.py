import os

import numpy as np
import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel

from crop_logic import _ROTATION, _fertilizer_advice, _irrigation_advice, _soil_health_tips
from crop_logic_recommend import get_crop_recommendations
from services.model_loader import get_crop_recommend_model

router = APIRouter()

# ml_service/ → project root → datasets/data_core.csv
_ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_ROOT = os.path.dirname(_ML_DIR)

def _find_dataset() -> str:
    candidates = [
        os.path.join(_ROOT, "dataset", "data_core.csv"),
        os.path.join(_ROOT, "datasets", "data_core.csv"),
    ]
    for p in candidates:
        if os.path.exists(os.path.abspath(p)):
            return os.path.abspath(p)
    return os.path.abspath(candidates[0])

_DATASET_PATH = _find_dataset()

# Feature order MUST match train_crop_model.py FEATURES list
_FEATURE_ORDER = ["Nitrogen", "Phosphorous", "Potassium", "Temparature", "Humidity", "Moisture"]

# Cache dataset stats — read CSV only once
_dataset_stats_cache: dict | None = None


class CropRecommendRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    moisture: float
    temperature: float
    rainfall: float
    humidity: float = 50.0
    last_crop: str = ""


@router.post("/recommend-crop")
async def recommend_crop(body: CropRecommendRequest):
    bundle = get_crop_recommend_model()

    # ── Rule-based advisory (always computed) ─────────────────────────────────
    rules = get_crop_recommendations(
        nitrogen=body.nitrogen,
        phosphorus=body.phosphorus,
        potassium=body.potassium,
        ph=body.ph,
        moisture=body.moisture,
        temperature=body.temperature,
        rainfall=body.rainfall,
        last_crop=body.last_crop,
    )

    # ── ML prediction ─────────────────────────────────────────────────────────
    ml_crop = None
    ml_confidence = None

    if bundle is not None:
        model = bundle["model"]
        le = bundle["label_encoder"]
        # Feature order: N, P, K, Temp, Humidity, Moisture  (matches training)
        X = np.array([[
            body.nitrogen,
            body.phosphorus,
            body.potassium,
            body.temperature,
            body.humidity,
            body.moisture,
        ]])
        proba = model.predict_proba(X)[0]
        class_idx = int(np.argmax(proba))
        ml_crop = str(le.inverse_transform([class_idx])[0])
        ml_confidence = round(float(proba[class_idx]), 4)

    # ── Crop rotation ─────────────────────────────────────────────────────────
    rotation_note = ""
    rotation_crop = ""
    lc = body.last_crop.lower().strip()
    for key, (next_crop, note) in _ROTATION.items():
        if key in lc:
            rotation_note = note
            rotation_crop = next_crop
            break

    return {
        "predicted_crop": ml_crop,
        "confidence": ml_confidence,
        "soil_analysis": rules["soil_analysis"],
        "environment": rules["environment"],
        "recommended_crops": rules["recommended_crops"],
        "secondary_crops": rules["secondary_crops"],
        "fertilizer_recommendation": rules["fertilizer_recommendation"],
        "irrigation_advice": rules["irrigation_advice"],
        "soil_health_tips": rules["soil_health_tips"],
        "crop_rotation": rotation_note or "Rotate crops each season to maintain soil health.",
        "rotation_suggestion": rotation_crop,
    }


@router.get("/dataset-stats")
async def dataset_stats():
    global _dataset_stats_cache
    if _dataset_stats_cache is not None:
        return _dataset_stats_cache

    if not os.path.exists(_DATASET_PATH):
        return {"error": "Dataset not found", "path": _DATASET_PATH}

    df = pd.read_csv(_DATASET_PATH)
    df.columns = df.columns.str.strip()

    # value_counts() returns a Series; .reset_index() column naming differs
    # between pandas <2.0 and >=2.0 — handle both
    vc = df["Crop Type"].value_counts().head(10).reset_index()
    if "Crop Type" in vc.columns:
        # pandas < 2.0: columns are ["Crop Type", "index"] or ["index", "Crop Type"]
        vc = vc.rename(columns={"index": "crop", "Crop Type": "count"})
    else:
        # pandas >= 2.0: columns are ["Crop Type", "count"]
        vc = vc.rename(columns={"Crop Type": "crop"})

    top_crops = vc[["crop", "count"]].to_dict(orient="records")

    _dataset_stats_cache = {
        "total_samples": len(df),
        "avg_nitrogen": round(float(df["Nitrogen"].mean()), 2),
        "avg_phosphorus": round(float(df["Phosphorous"].mean()), 2),
        "avg_potassium": round(float(df["Potassium"].mean()), 2),
        "avg_temperature": round(float(df["Temparature"].mean()), 2),
        "avg_humidity": round(float(df["Humidity"].mean()), 2),
        "avg_moisture": round(float(df["Moisture"].mean()), 2),
        "top_crops": top_crops,
        "unique_crops": int(df["Crop Type"].nunique()),
        "unique_soil_types": int(df["Soil Type"].nunique()),
    }
    return _dataset_stats_cache
