"""
Rule-based crop recommendation engine.
Uses N, P, K, pH, moisture, temperature, and rainfall to suggest crops.
"""

# ── Crop rotation map ─────────────────────────────────────────────────────────
_ROTATION = {
    "wheat": ("Lentils", "After wheat, plant lentils or chickpeas to restore soil nitrogen."),
    "rice": ("Pulses", "After rice, plant pulses (moong/urad) to replenish nitrogen."),
    "maize": ("Soybean", "After maize, plant soybean to fix atmospheric nitrogen."),
    "cotton": ("Groundnut", "After cotton, plant groundnut to improve soil organic matter."),
    "sugarcane": ("Onion", "After sugarcane, plant onion or garlic to break pest cycles."),
    "potato": ("Legumes", "After potato, plant legumes to restore potassium and nitrogen."),
    "soybean": ("Wheat", "After soybean, plant wheat to utilise residual nitrogen."),
}


def _classify_moisture(moisture: float) -> str:
    if moisture < 30:
        return "Low"
    if moisture < 60:
        return "Moderate"
    return "High"


def _ph_crops(ph: float) -> list:
    if ph < 5.5:
        return ["Tea", "Coffee", "Blueberry", "Sweet Potato"]
    if ph < 6.5:
        return ["Potato", "Groundnut", "Millets", "Oats"]
    if ph <= 7.5:
        return ["Wheat", "Rice", "Maize", "Tomato", "Sugarcane", "Soybean"]
    if ph <= 8.5:
        return ["Barley", "Asparagus", "Cotton", "Sorghum"]
    return ["Barley", "Beet", "Spinach"]


def _nitrogen_crops(n: float) -> list:
    if n < 20:
        return ["Lentils", "Chickpeas", "Moong Bean", "Cowpea"]   # legumes fix N
    if n < 50:
        return ["Wheat", "Maize", "Sorghum", "Millet"]
    return ["Rice", "Sugarcane", "Maize", "Cabbage", "Spinach"]


def _rainfall_crops(rainfall: float) -> list:
    if rainfall < 50:
        return ["Millet", "Sorghum", "Barley", "Groundnut"]
    if rainfall < 150:
        return ["Wheat", "Maize", "Cotton", "Soybean"]
    return ["Rice", "Sugarcane", "Jute", "Banana"]


def _temperature_crops(temp: float) -> list:
    if temp < 15:
        return ["Wheat", "Barley", "Oats", "Peas"]
    if temp < 25:
        return ["Wheat", "Maize", "Potato", "Tomato", "Soybean"]
    if temp < 35:
        return ["Rice", "Cotton", "Maize", "Sugarcane", "Groundnut"]
    return ["Cotton", "Millet", "Sorghum", "Cassava"]


def _fertilizer_advice(n: float, p: float, k: float) -> list:
    tips = []
    if n < 30:
        tips.append("Apply urea or ammonium nitrate to boost nitrogen (low N detected).")
    if p < 20:
        tips.append("Apply DAP (Di-Ammonium Phosphate) to correct phosphorus deficiency.")
    if k < 20:
        tips.append("Apply MOP (Muriate of Potash) to correct potassium deficiency.")
    if n >= 30 and p >= 20 and k >= 20:
        tips.append("Balanced NPK levels — apply standard NPK 120:60:60 kg/ha for maintenance.")
    tips.append("Add organic compost (2–3 tonnes/ha) to improve soil structure and microbial activity.")
    return tips


def _irrigation_advice(moisture: float, rainfall: float, temperature: float) -> str:
    if moisture < 30 and rainfall < 50:
        return "Soil is dry and rainfall is low — irrigate every 3–4 days using drip irrigation."
    if moisture > 60 or rainfall > 150:
        return "High moisture/rainfall — reduce irrigation frequency; ensure proper field drainage."
    if temperature > 35:
        return "High temperature — irrigate early morning or evening to minimise evaporation."
    return "Moderate conditions — irrigate every 5–7 days; monitor soil moisture regularly."


def _soil_health_tips(ph: float, n: float, p: float, k: float) -> list:
    tips = ["Practice crop rotation every season to prevent nutrient depletion."]
    if ph < 6.0:
        tips.append("Apply agricultural lime (1–2 tonnes/ha) to raise soil pH.")
    elif ph > 8.0:
        tips.append("Apply gypsum or sulphur to lower soil pH gradually.")
    if n < 25:
        tips.append("Grow green manure crops (dhaincha, sunhemp) to fix atmospheric nitrogen.")
    tips.append("Add organic matter (compost/FYM) to improve water retention and microbial life.")
    tips.append("Minimise chemical fertiliser use — switch to integrated nutrient management.")
    return tips
