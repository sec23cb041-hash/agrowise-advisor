const express = require('express');
const router = express.Router();

// ── Farming knowledge base ────────────────────────────────────────────────────

const KNOWLEDGE = {
  fertilizer: {
    rice: "For rice, apply Urea (120 kg/ha) in 3 splits, DAP (60 kg/ha) at transplanting, and MOP (40 kg/ha) at panicle initiation. Zinc sulfate (25 kg/ha) corrects micronutrient deficiency.",
    wheat: "For wheat, apply DAP (100 kg/ha) as basal dose, Urea (120 kg/ha) in 2 splits at crown root and tillering stages.",
    cotton: "For cotton, apply NPK 120:60:60 kg/ha. Apply gypsum (400 kg/ha) on black soils. Boron spray (0.2%) at flowering improves boll setting.",
    tomato: "For tomato, apply FYM (25 t/ha) before planting. NPK 150:75:75 kg/ha in splits. Calcium nitrate spray prevents blossom end rot.",
    sugarcane: "For sugarcane, apply FYM (50 t/ha) + NPK 250:100:120 kg/ha. Apply in 3 splits. Trash mulching conserves moisture.",
    maize: "For maize, apply NPK 120:60:40 kg/ha. Apply Urea in 3 splits. Zinc sulfate (25 kg/ha) as basal dose.",
    default: "Apply a balanced NPK fertilizer based on soil test results. Generally, NPK 120:60:40 kg/ha is recommended for most crops. Add organic compost (5–10 t/ha) to improve soil health.",
  },
  pest: {
    rice: "For rice pests: use Chlorpyrifos (2 ml/L) for stem borer. Imidacloprid (0.5 ml/L) for BPH. Release Trichogramma cards (1 lakh/ha) for biological control.",
    cotton: "For cotton pests: use Spinosad (0.3 ml/L) for bollworm. Neem oil (5 ml/L) for sucking pests. Yellow sticky traps for whitefly monitoring.",
    tomato: "For tomato pests: use Bt spray for fruit borer. Imidacloprid for leaf miner. Pheromone traps for monitoring. Remove and destroy infested fruits.",
    default: "For pest control: identify the pest first. Use neem oil (5 ml/L) as a safe organic option. For severe infestations, consult your local agricultural extension officer for chemical recommendations.",
  },
  irrigation: {
    rice: "Rice requires 1200–2000 mm water. Maintain 5 cm standing water during vegetative stage. Drain field 10 days before harvest.",
    wheat: "Wheat needs 4–6 irrigations. Critical stages: crown root initiation (21 DAS), tillering (45 DAS), jointing (65 DAS), and grain filling (90 DAS).",
    cotton: "Cotton needs irrigation at 10–15 day intervals. Critical stages: squaring, flowering, and boll development. Avoid waterlogging.",
    tomato: "Tomato needs regular irrigation every 5–7 days. Drip irrigation saves 40% water. Avoid wetting foliage to prevent fungal diseases.",
    default: "Irrigate based on crop stage and soil moisture. Drip irrigation is most efficient. Avoid waterlogging and irrigate in the morning or evening.",
  },
  disease: {
    rice: "Common rice diseases: Blast (use Tricyclazole 0.6 g/L), Sheath blight (Hexaconazole 1 ml/L), BLB (Copper oxychloride 3 g/L). Maintain field hygiene.",
    tomato: "Common tomato diseases: Early blight (Mancozeb 2 g/L), Late blight (Metalaxyl 2.5 g/L), Wilt (soil drenching with Carbendazim). Use resistant varieties.",
    wheat: "Common wheat diseases: Rust (Propiconazole 1 ml/L), Powdery mildew (Sulfur 3 g/L), Loose smut (seed treatment with Carboxin).",
    default: "For disease management: remove infected plant parts, improve air circulation, avoid overhead irrigation. Apply appropriate fungicide or bactericide based on disease type.",
  },
  planting: {
    rice: "Best time to plant rice in South India: Kharif (June–July), Rabi (November–December). Use certified seeds. Transplant 25-day-old seedlings.",
    wheat: "Plant wheat in October–November in North India. Sow at 100 kg/ha seed rate. Maintain 22.5 cm row spacing.",
    tomato: "Plant tomatoes in October–November (winter) or June–July (summer) in South India. Transplant 25–30 day old seedlings. Maintain 60×45 cm spacing.",
    cotton: "Plant cotton in May–June after pre-monsoon showers. Use Bt cotton hybrids. Maintain 90×60 cm spacing.",
    default: "Planting time depends on your region and crop. Consult your local agricultural calendar. Use certified seeds and follow recommended spacing for your crop.",
  },
  soil: {
    default: "Conduct a soil test every 2–3 years. Maintain soil pH between 6.0–7.5 for most crops. Add organic matter (FYM/compost) to improve soil health and water retention.",
  },
  weather: {
    default: "Monitor weather forecasts regularly. Avoid pesticide spraying on windy or rainy days. Irrigate before expected dry spells. Protect crops from frost with covers.",
  },
  price: {
    default: "Check the latest MSP (Minimum Support Price) on the government e-NAM portal or your local APMC market. Prices vary by region and season.",
  },
};

// ── Language translations (key phrases) ──────────────────────────────────────

const LANG_PREFIXES = {
  "ta-IN": "விவசாய ஆலோசனை: ",
  "hi-IN": "कृषि सलाह: ",
  "en-US": "",
};

// ── Query classifier ──────────────────────────────────────────────────────────

function classifyQuery(q) {
  const text = q.toLowerCase();

  // Detect crop
  let crop = "default";
  if (text.includes("rice") || text.includes("paddy") || text.includes("நெல்") || text.includes("धान")) crop = "rice";
  else if (text.includes("wheat") || text.includes("கோதுமை") || text.includes("गेहूं")) crop = "wheat";
  else if (text.includes("cotton") || text.includes("பருத்தி") || text.includes("कपास")) crop = "cotton";
  else if (text.includes("tomato") || text.includes("தக்காளி") || text.includes("टमाटर")) crop = "tomato";
  else if (text.includes("sugarcane") || text.includes("கரும்பு") || text.includes("गन्ना")) crop = "sugarcane";
  else if (text.includes("maize") || text.includes("corn") || text.includes("மக்காச்சோளம்") || text.includes("मक्का")) crop = "maize";

  // Detect topic
  if (text.includes("fertilizer") || text.includes("urea") || text.includes("npk") || text.includes("உரம்") || text.includes("खाद")) {
    return { topic: "fertilizer", crop };
  }
  if (text.includes("pest") || text.includes("insect") || text.includes("bug") || text.includes("பூச்சி") || text.includes("कीट")) {
    return { topic: "pest", crop };
  }
  if (text.includes("disease") || text.includes("blight") || text.includes("fungal") || text.includes("நோய்") || text.includes("रोग")) {
    return { topic: "disease", crop };
  }
  if (text.includes("irrigat") || text.includes("water") || text.includes("நீர்") || text.includes("सिंचाई")) {
    return { topic: "irrigation", crop };
  }
  if (text.includes("plant") || text.includes("sow") || text.includes("seed") || text.includes("நட") || text.includes("बुवाई")) {
    return { topic: "planting", crop };
  }
  if (text.includes("soil") || text.includes("மண்") || text.includes("मिट्टी")) {
    return { topic: "soil", crop: "default" };
  }
  if (text.includes("weather") || text.includes("rain") || text.includes("forecast") || text.includes("மழை") || text.includes("मौसम")) {
    return { topic: "weather", crop: "default" };
  }
  if (text.includes("price") || text.includes("market") || text.includes("விலை") || text.includes("कीमत")) {
    return { topic: "price", crop: "default" };
  }

  return { topic: null, crop };
}

function generateAnswer(question, lang) {
  const { topic, crop } = classifyQuery(question);
  const prefix = LANG_PREFIXES[lang] || "";

  if (!topic) {
    return prefix + "I can help with fertilizer recommendations, pest control, irrigation, disease management, planting schedules, soil health, and market prices. Please ask a specific farming question.";
  }

  const topicData = KNOWLEDGE[topic];
  const answer = topicData[crop] || topicData["default"];
  return prefix + answer;
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.post('/', (req, res) => {
  const { question, lang } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Question is required" });
  }
  const answer = generateAnswer(question.trim(), lang || "en-US");
  res.json({ question: question.trim(), answer });
});

module.exports = router;
