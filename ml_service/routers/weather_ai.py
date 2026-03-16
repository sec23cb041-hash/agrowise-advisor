"""
GET /weather-ai?city=Chennai
GET /weather-ai?lat=12.96&lon=80.06

Returns:
  - current weather stats
  - AI rain prediction (classifier)
  - AI rainfall amount (regressor)
  - 7-day forecast (feature-varied per day)
  - crop risk alerts
"""
import os
import random
import httpx
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional

from services.model_loader import get_rain_classifier, get_rainfall_regressor

router = APIRouter()

_OWM_KEYS = [
    os.getenv("OPENWEATHER_API_KEY"),
    os.getenv("OPENWEATHER_API_KEY_1"),
    os.getenv("OPENWEATHER_API_KEY_2"),
    "5996e4a913392d79bca0e6a530fb9b6a",
    "c88dcc69860896dd92860049194510ee",
]
_OWM_KEYS = list(dict.fromkeys(k for k in _OWM_KEYS if k))

_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


async def _owm_fetch(params: dict) -> dict:
    for key in _OWM_KEYS:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={**params, "units": "metric", "appid": key},
                )
            if r.status_code == 200:
                return r.json()
        except Exception:
            continue
    raise HTTPException(status_code=503, detail="Weather service unavailable")


def _extract_features(owm: dict) -> dict:
    return {
        "Temperature": round(float(owm["main"]["temp"]), 1),
        "Humidity": float(owm["main"]["humidity"]),
        "Wind_Speed": round(float(owm["wind"]["speed"]), 1),
        "Cloud_Cover": float(owm["clouds"]["all"]),
        "Pressure": float(owm["main"]["pressure"]),
    }


def _ai_predict(features: dict) -> tuple[bool, float, float]:
    """Returns (will_rain, rain_probability, rainfall_mm)."""
    clf = get_rain_classifier()
    reg = get_rainfall_regressor()

    feat_order = ["Temperature", "Humidity", "Wind_Speed", "Cloud_Cover", "Pressure"]
    X = [[features[f] for f in feat_order]]

    if clf is not None:
        proba = clf["model"].predict_proba(X)[0]
        rain_prob = float(proba[1])
        will_rain = rain_prob >= 0.5
    else:
        # Heuristic fallback
        rain_prob = min(features["Humidity"] / 100 * 0.8 + features["Cloud_Cover"] / 100 * 0.2, 1.0)
        will_rain = rain_prob >= 0.5

    if reg is not None:
        rainfall_mm = max(0.0, float(reg["model"].predict(X)[0]))
    else:
        rainfall_mm = round(rain_prob * 12, 1) if will_rain else 0.0

    return will_rain, round(rain_prob, 3), round(rainfall_mm, 1)


def _generate_forecast(base: dict, will_rain: bool, rainfall_mm: float) -> list[dict]:
    """Generate 7-day forecast by varying base features slightly."""
    rng = random.Random(int(base["Temperature"] * 100 + base["Humidity"]))
    forecast = []
    for i, day in enumerate(_DAYS):
        varied = {
            "Temperature": round(base["Temperature"] + rng.uniform(-3, 3), 1),
            "Humidity": min(100, max(10, base["Humidity"] + rng.uniform(-10, 10))),
            "Wind_Speed": max(0, base["Wind_Speed"] + rng.uniform(-1.5, 1.5)),
            "Cloud_Cover": min(100, max(0, base["Cloud_Cover"] + rng.uniform(-20, 20))),
            "Pressure": base["Pressure"] + rng.uniform(-5, 5),
        }
        day_rain, day_prob, day_mm = _ai_predict(varied)
        forecast.append({
            "day": day,
            "temperature": varied["Temperature"],
            "humidity": round(varied["Humidity"], 1),
            "wind_speed": round(varied["Wind_Speed"], 1),
            "cloud_cover": round(varied["Cloud_Cover"], 1),
            "will_rain": day_rain,
            "rain_probability": day_prob,
            "rainfall_mm": day_mm,
        })
    return forecast


def _crop_risk_alerts(features: dict, will_rain: bool, rainfall_mm: float) -> list[dict]:
    alerts = []
    temp = features["Temperature"]
    humidity = features["Humidity"]
    wind = features["Wind_Speed"]

    if humidity > 80 and temp > 25:
        alerts.append({"level": "high", "message": "High fungal disease risk — avoid overhead irrigation and apply preventive fungicide."})
    if will_rain and rainfall_mm > 20:
        alerts.append({"level": "high", "message": f"Heavy rainfall expected ({rainfall_mm} mm) — check drainage and delay fertilizer application."})
    elif will_rain and rainfall_mm > 5:
        alerts.append({"level": "medium", "message": f"Moderate rain expected ({rainfall_mm} mm) — good time to skip irrigation."})
    if wind > 8:
        alerts.append({"level": "medium", "message": "High wind speed — avoid pesticide/herbicide spraying to prevent drift."})
    if temp > 38:
        alerts.append({"level": "high", "message": "Extreme heat — increase irrigation frequency and apply mulch to retain soil moisture."})
    elif temp < 10:
        alerts.append({"level": "medium", "message": "Cold temperatures — protect frost-sensitive crops with covers."})
    if not alerts:
        alerts.append({"level": "low", "message": "Conditions look good for most field operations today."})

    return alerts


@router.get("/weather-ai")
async def weather_ai(
    city: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
):
    if not city and (lat is None or lon is None):
        raise HTTPException(status_code=400, detail="Provide city or lat+lon")

    params = {"q": city} if city else {"lat": lat, "lon": lon}
    owm = await _owm_fetch(params)

    features = _extract_features(owm)
    will_rain, rain_prob, rainfall_mm = _ai_predict(features)
    forecast = _generate_forecast(features, will_rain, rainfall_mm)
    alerts = _crop_risk_alerts(features, will_rain, rainfall_mm)

    return {
        "city": owm.get("name", city or f"{lat},{lon}"),
        "country": owm.get("sys", {}).get("country", ""),
        "description": owm["weather"][0]["description"] if owm.get("weather") else "",
        "current": {
            "temperature": features["Temperature"],
            "humidity": features["Humidity"],
            "wind_speed": features["Wind_Speed"],
            "cloud_cover": features["Cloud_Cover"],
            "pressure": features["Pressure"],
            "rainfall_1h": float(owm.get("rain", {}).get("1h", 0)),
        },
        "ai_prediction": {
            "will_rain": will_rain,
            "rain_probability": rain_prob,
            "predicted_rainfall_mm": rainfall_mm,
        },
        "forecast": forecast,
        "crop_risk_alerts": alerts,
    }
