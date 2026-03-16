"""
get_crop_recommendations — combines all rule engines into a single response dict.
Imported by knowledge.py via a thin wrapper.
"""
from crop_logic import (
    _classify_moisture,
    _ph_crops,
    _nitrogen_crops,
    _rainfall_crops,
    _temperature_crops,
    _fertilizer_advice,
    _irrigation_advice,
    _soil_health_tips,
    _ROTATION,
)


def get_crop_recommendations(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float,
    moisture: float,
    temperature: float,
    rainfall: float,
    last_crop: str = "",
) -> dict:
    # Score crops by how many rule sets recommend them
    candidate_sets = [
        set(_ph_crops(ph)),
        set(_nitrogen_crops(nitrogen)),
        set(_rainfall_crops(rainfall)),
        set(_temperature_crops(temperature)),
    ]

    scores: dict[str, int] = {}
    for s in candidate_sets:
        for crop in s:
            scores[crop] = scores.get(crop, 0) + 1

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    primary = [c for c, s in ranked if s >= 3][:5]
    secondary = [c for c, s in ranked if s == 2][:4]

    # Fallback: if nothing scored ≥3, take top 3 by score
    if not primary:
        primary = [c for c, _ in ranked[:3]]

    # Crop rotation
    rotation_note = ""
    rotation_crop = ""
    lc = last_crop.lower().strip()
    for key, (next_crop, note) in _ROTATION.items():
        if key in lc:
            rotation_note = note
            rotation_crop = next_crop
            break

    moisture_label = _classify_moisture(moisture)

    return {
        "soil_analysis": {
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "ph": ph,
            "moisture": moisture_label,
        },
        "environment": {
            "temperature": temperature,
            "rainfall": rainfall,
        },
        "recommended_crops": primary,
        "secondary_crops": secondary,
        "fertilizer_recommendation": _fertilizer_advice(nitrogen, phosphorus, potassium),
        "irrigation_advice": _irrigation_advice(moisture, rainfall, temperature),
        "soil_health_tips": _soil_health_tips(ph, nitrogen, phosphorus, potassium),
        "crop_rotation": rotation_note or (
            "Rotate crops each season to maintain soil health and break pest cycles."
        ),
        "rotation_suggestion": rotation_crop,
    }
