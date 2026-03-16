"""
POST /voice-advisory
{ "question": "best fertilizer for rice", "lang": "en-US" }
Returns: { "question": "...", "answer": "..." }
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# ── Knowledge base ────────────────────────────────────────────────────────────

_KB = {
    ("fertilizer", "rice"):     "For rice, apply Urea (120 kg/ha) in 3 splits, DAP (60 kg/ha) at transplanting, and MOP (40 kg/ha) at panicle initiation. Add Zinc sulfate (25 kg/ha) to correct micronutrient deficiency.",
    ("fertilizer", "wheat"):    "For wheat, apply DAP (100 kg/ha) as basal dose and Urea (120 kg/ha) in 2 splits at crown root initiation and tillering stages.",
    ("fertilizer", "cotton"):   "For cotton, apply NPK 120:60:60 kg/ha. Apply gypsum (400 kg/ha) on black soils. Boron spray (0.2%) at flowering improves boll setting.",
    ("fertilizer", "tomato"):   "For tomato, apply FYM (25 t/ha) before planting, then NPK 150:75:75 kg/ha in splits. Calcium nitrate spray prevents blossom end rot.",
    ("fertilizer", "sugarcane"):"For sugarcane, apply FYM (50 t/ha) + NPK 250:100:120 kg/ha in 3 splits. Trash mulching conserves moisture.",
    ("fertilizer", "maize"):    "For maize, apply NPK 120:60:40 kg/ha. Apply Urea in 3 splits. Zinc sulfate (25 kg/ha) as basal dose.",
    ("fertilizer", "default"):  "Apply balanced NPK fertilizer based on soil test results. NPK 120:60:40 kg/ha suits most crops. Add organic compost (5-10 t/ha) to improve soil health.",

    ("pest", "rice"):    "For rice pests: use Chlorpyrifos (2 ml/L) for stem borer, Imidacloprid (0.5 ml/L) for BPH. Release Trichogramma cards (1 lakh/ha) for biological control.",
    ("pest", "cotton"):  "For cotton pests: use Spinosad (0.3 ml/L) for bollworm, Neem oil (5 ml/L) for sucking pests. Yellow sticky traps monitor whitefly.",
    ("pest", "tomato"):  "For tomato pests: use Bt spray for fruit borer, Imidacloprid for leaf miner. Pheromone traps for monitoring. Remove infested fruits.",
    ("pest", "default"): "Use Neem oil (5 ml/L) as a safe organic option. For severe infestations, consult your local agricultural extension officer for chemical recommendations.",

    ("disease", "rice"):   "Rice diseases: Blast — use Tricyclazole (0.6 g/L). Sheath blight — Hexaconazole (1 ml/L). BLB — Copper oxychloride (3 g/L). Maintain field hygiene.",
    ("disease", "tomato"): "Tomato diseases: Early blight — Mancozeb (2 g/L). Late blight — Metalaxyl (2.5 g/L). Wilt — soil drench with Carbendazim. Use resistant varieties.",
    ("disease", "wheat"):  "Wheat diseases: Rust — Propiconazole (1 ml/L). Powdery mildew — Sulfur (3 g/L). Loose smut — seed treatment with Carboxin.",
    ("disease", "default"):"Remove infected plant parts, improve air circulation, avoid overhead irrigation. Apply appropriate fungicide based on disease type.",

    ("irrigation", "rice"):    "Rice needs 1200-2000 mm water. Maintain 5 cm standing water during vegetative stage. Drain field 10 days before harvest.",
    ("irrigation", "wheat"):   "Wheat needs 4-6 irrigations at: crown root initiation (21 DAS), tillering (45 DAS), jointing (65 DAS), and grain filling (90 DAS).",
    ("irrigation", "cotton"):  "Cotton needs irrigation every 10-15 days. Critical stages: squaring, flowering, and boll development. Avoid waterlogging.",
    ("irrigation", "tomato"):  "Tomato needs irrigation every 5-7 days. Drip irrigation saves 40% water. Avoid wetting foliage to prevent fungal diseases.",
    ("irrigation", "default"): "Irrigate based on crop stage and soil moisture. Drip irrigation is most efficient. Avoid waterlogging; irrigate in morning or evening.",

    ("planting", "rice"):    "Plant rice in South India: Kharif (June-July), Rabi (November-December). Use certified seeds. Transplant 25-day-old seedlings.",
    ("planting", "wheat"):   "Plant wheat in October-November in North India. Sow at 100 kg/ha seed rate. Maintain 22.5 cm row spacing.",
    ("planting", "tomato"):  "Plant tomatoes in October-November (winter) or June-July (summer) in South India. Transplant 25-30 day old seedlings at 60x45 cm spacing.",
    ("planting", "cotton"):  "Plant cotton in May-June after pre-monsoon showers. Use Bt cotton hybrids. Maintain 90x60 cm spacing.",
    ("planting", "default"): "Planting time depends on your region and crop. Use certified seeds and follow recommended spacing. Consult your local agricultural calendar.",

    ("soil", "default"):    "Conduct a soil test every 2-3 years. Maintain pH 6.0-7.5 for most crops. Add organic matter (FYM/compost) to improve soil health and water retention.",
    ("weather", "default"): "Monitor weather forecasts regularly. Avoid pesticide spraying on windy or rainy days. Irrigate before expected dry spells. Protect crops from frost.",
    ("price", "default"):   "Check the latest MSP on the government e-NAM portal or your local APMC market. Prices vary by region and season.",
}

_LANG_PREFIX = {
    "ta-IN": "விவசாய ஆலோசனை: ",
    "hi-IN": "कृषि सलाह: ",
}

_FALLBACK = (
    "I can help with fertilizer recommendations, pest control, irrigation schedules, "
    "disease management, planting times, soil health, and market prices. "
    "Please ask a specific farming question — for example: 'best fertilizer for rice' "
    "or 'how to control pests in cotton'."
)


# ── Classifier ────────────────────────────────────────────────────────────────

def _classify(text: str):
    t = text.lower()

    crop = "default"
    if any(w in t for w in ["rice", "paddy", "நெல்", "धान"]):           crop = "rice"
    elif any(w in t for w in ["wheat", "கோதுமை", "गेहूं"]):             crop = "wheat"
    elif any(w in t for w in ["cotton", "பருத்தி", "कपास"]):            crop = "cotton"
    elif any(w in t for w in ["tomato", "தக்காளி", "टमाटर"]):           crop = "tomato"
    elif any(w in t for w in ["sugarcane", "கரும்பு", "गन्ना"]):        crop = "sugarcane"
    elif any(w in t for w in ["maize", "corn", "மக்காச்சோளம்", "मक्का"]): crop = "maize"

    if any(w in t for w in ["fertilizer", "urea", "npk", "dap", "உரம்", "खाद", "manure", "nutrient"]):
        return "fertilizer", crop
    if any(w in t for w in ["pest", "insect", "bug", "worm", "பூச்சி", "कीट", "bollworm", "aphid"]):
        return "pest", crop
    if any(w in t for w in ["disease", "blight", "blast", "fungal", "rust", "நோய்", "रोग", "infection", "mildew"]):
        return "disease", crop
    if any(w in t for w in ["irrigat", "water", "நீர்", "सिंचाई", "drip", "flood"]):
        return "irrigation", crop
    if any(w in t for w in ["plant", "sow", "seed", "நட", "बुवाई", "transplant", "grow", "when to"]):
        return "planting", crop
    if any(w in t for w in ["soil", "மண்", "मिट्टी", "ph", "compost"]):
        return "soil", "default"
    if any(w in t for w in ["weather", "rain", "forecast", "மழை", "मौसम", "temperature", "humidity"]):
        return "weather", "default"
    if any(w in t for w in ["price", "market", "விலை", "कीमत", "msp", "rate", "sell"]):
        return "price", "default"

    return None, crop


def _answer(question: str, lang: str) -> str:
    topic, crop = _classify(question)
    prefix = _LANG_PREFIX.get(lang, "")

    if topic is None:
        return prefix + _FALLBACK

    answer = _KB.get((topic, crop)) or _KB.get((topic, "default")) or _FALLBACK
    return prefix + answer


# ── Schema + Route ────────────────────────────────────────────────────────────

class VoiceRequest(BaseModel):
    question: str
    lang: str = "en-US"


@router.post("/voice-advisory")
async def voice_advisory(body: VoiceRequest):
    q = body.question.strip()
    if not q:
        return {"question": q, "answer": _FALLBACK}
    return {"question": q, "answer": _answer(q, body.lang)}
