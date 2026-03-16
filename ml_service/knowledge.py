"""
Agricultural knowledge base for soil types and crop diseases.
Used to enrich ML predictions with farmer-friendly recommendations.
"""
from crop_logic_recommend import get_crop_recommendations  # noqa: F401 – re-exported

SOIL_KNOWLEDGE = {
    "alluvial soil": {
        "display": "Alluvial Soil",
        "properties": {
            "drainage": "Moderate to Good",
            "fertility": "Very High",
            "water_retention": "Moderate",
            "texture": "Sandy loam to clay loam",
            "ph_range": "6.5 – 7.5",
        },
        "recommendations": {
            "crops": ["Rice", "Wheat", "Sugarcane", "Maize", "Pulses", "Vegetables"],
            "fertilizer": "Balanced NPK (120:60:40 kg/ha). Add zinc sulfate if deficient.",
            "irrigation": "Moderate irrigation; avoid waterlogging. Drip or furrow irrigation recommended.",
            "improvement_tips": [
                "Add organic compost to maintain structure",
                "Practice crop rotation to prevent nutrient depletion",
                "Test soil pH annually and lime if acidic",
            ],
        },
    },
    "black soil": {
        "display": "Black Soil (Regur)",
        "properties": {
            "drainage": "Poor – prone to waterlogging",
            "fertility": "High in Ca, Mg, K; low in N and P",
            "water_retention": "Very High",
            "texture": "Heavy clay",
            "ph_range": "7.5 – 8.5",
        },
        "recommendations": {
            "crops": ["Cotton", "Soybean", "Sorghum", "Wheat", "Sunflower"],
            "fertilizer": "Apply gypsum (200 kg/ha) to improve structure. Add nitrogen and phosphorus.",
            "irrigation": "Controlled irrigation; avoid over-watering. Ridge-and-furrow method preferred.",
            "improvement_tips": [
                "Add gypsum to improve drainage and reduce cracking",
                "Avoid heavy machinery when wet to prevent compaction",
                "Use raised beds for vegetable crops",
            ],
        },
    },
    "clay soil": {
        "display": "Clay Soil",
        "properties": {
            "drainage": "Poor",
            "fertility": "High nutrient retention",
            "water_retention": "Very High",
            "texture": "Fine, sticky when wet",
            "ph_range": "6.0 – 7.0",
        },
        "recommendations": {
            "crops": ["Rice", "Broccoli", "Cabbage", "Brussels sprouts", "Aster"],
            "fertilizer": "Gypsum improves structure. Balanced NPK with organic matter.",
            "irrigation": "Controlled watering; allow soil to dry between irrigations.",
            "improvement_tips": [
                "Mix in coarse sand and organic matter to improve drainage",
                "Avoid tilling when wet",
                "Mulch surface to prevent crusting",
            ],
        },
    },
    "red soil": {
        "display": "Red Soil",
        "properties": {
            "drainage": "Good to Excessive",
            "fertility": "Low – deficient in N, P, organic matter",
            "water_retention": "Low",
            "texture": "Sandy to loamy",
            "ph_range": "5.5 – 7.0",
        },
        "recommendations": {
            "crops": ["Groundnut", "Millets", "Tobacco", "Potato", "Pulses"],
            "fertilizer": "Heavy organic manure application. NPK 80:40:40 kg/ha. Lime to correct acidity.",
            "irrigation": "Frequent light irrigation; drip irrigation is ideal.",
            "improvement_tips": [
                "Add green manure or compost to boost organic matter",
                "Apply lime to raise pH if below 5.5",
                "Use mulching to reduce moisture loss",
            ],
        },
    },
    "sandy soil": {
        "display": "Sandy Soil",
        "properties": {
            "drainage": "Excellent – drains very fast",
            "fertility": "Low – nutrients leach quickly",
            "water_retention": "Very Low",
            "texture": "Coarse, gritty",
            "ph_range": "5.5 – 7.0",
        },
        "recommendations": {
            "crops": ["Carrots", "Peanuts", "Watermelon", "Radish", "Potatoes"],
            "fertilizer": "Frequent small doses of fertilizer. Add organic compost heavily.",
            "irrigation": "Frequent light watering; drip irrigation essential.",
            "improvement_tips": [
                "Add large amounts of organic compost to improve water retention",
                "Use mulch to reduce evaporation",
                "Apply slow-release fertilizers to reduce leaching",
            ],
        },
    },
    "loamy soil": {
        "display": "Loamy Soil",
        "properties": {
            "drainage": "Good",
            "fertility": "High – balanced nutrients",
            "water_retention": "Moderate",
            "texture": "Balanced mix of sand, silt, clay",
            "ph_range": "6.0 – 7.0",
        },
        "recommendations": {
            "crops": ["Wheat", "Sugarcane", "Tomato", "Onion", "Most vegetables"],
            "fertilizer": "Balanced NPK (120:60:60 kg/ha). Maintain organic matter with compost.",
            "irrigation": "Moderate irrigation; well-suited for most methods.",
            "improvement_tips": [
                "Maintain organic matter with annual compost additions",
                "Practice crop rotation for long-term fertility",
                "Minimal amendment needed – ideal for most crops",
            ],
        },
    },
}

DISEASE_KNOWLEDGE = {
    "bacterial blight": {
        "display": "Bacterial Blight",
        "description": "A bacterial disease causing water-soaked lesions that turn yellow-brown, commonly affecting rice and other cereals.",
        "symptoms": [
            "Water-soaked lesions on leaf margins",
            "Yellowing and wilting of leaves",
            "Milky or opaque bacterial ooze from cut stems",
            "Leaf tips turn yellow then brown",
        ],
        "causes": ["Xanthomonas oryzae bacteria", "High humidity and warm temperatures", "Infected seeds or plant debris"],
        "treatment": {
            "organic": ["Remove and destroy infected plant material", "Apply copper-based bactericide spray", "Use neem cake in soil"],
            "chemical": ["Streptomycin sulfate (0.5g/L)", "Copper oxychloride (3g/L)", "Kasugamycin spray"],
        },
        "prevention": [
            "Use certified disease-free seeds",
            "Avoid excess nitrogen fertilizer",
            "Ensure proper field drainage",
            "Practice crop rotation",
        ],
    },
    "blast": {
        "display": "Rice Blast",
        "description": "A devastating fungal disease caused by Magnaporthe oryzae, affecting leaves, nodes, and panicles of rice.",
        "symptoms": [
            "Diamond-shaped lesions with gray centers and brown borders",
            "White to gray lesions on leaf collar",
            "Neck rot causing panicle to fall over",
            "Lesions on nodes turning black",
        ],
        "causes": ["Magnaporthe oryzae fungus", "Cool nights with warm days", "High humidity and leaf wetness", "Excess nitrogen"],
        "treatment": {
            "organic": ["Neem oil spray (5ml/L)", "Remove infected leaves immediately", "Silicon-based foliar spray"],
            "chemical": ["Tricyclazole 75% WP (0.6g/L)", "Isoprothiolane (1.5ml/L)", "Propiconazole fungicide"],
        },
        "prevention": [
            "Use blast-resistant rice varieties",
            "Avoid excess nitrogen fertilizer",
            "Maintain proper plant spacing for air circulation",
            "Drain fields periodically",
        ],
    },
    "brown spot": {
        "display": "Brown Spot",
        "description": "A fungal disease caused by Helminthosporium oryzae, producing brown oval spots on leaves and grains.",
        "symptoms": [
            "Oval to circular brown spots on leaves",
            "Spots with yellow halo around them",
            "Dark brown discoloration on grain husks",
            "Seedling blight in nurseries",
        ],
        "causes": ["Helminthosporium oryzae fungus", "Nutrient-deficient soils (especially potassium)", "Drought stress"],
        "treatment": {
            "organic": ["Seed treatment with Trichoderma viride", "Neem oil foliar spray"],
            "chemical": ["Mancozeb 75% WP (2g/L)", "Iprobenfos (1.5ml/L)", "Edifenphos spray"],
        },
        "prevention": [
            "Apply balanced fertilizers, especially potassium",
            "Use treated seeds",
            "Avoid water stress during critical growth stages",
        ],
    },
    "early blight": {
        "display": "Early Blight",
        "description": "A common fungal disease caused by Alternaria solani, affecting tomatoes, potatoes, and other solanaceous crops.",
        "symptoms": [
            "Dark brown concentric ring spots on lower leaves",
            "Yellow halo surrounding lesions",
            "Premature defoliation starting from bottom",
            "Dark sunken lesions on stems and fruit",
        ],
        "causes": ["Alternaria solani fungus", "Warm humid weather (24–29°C)", "Infected plant debris in soil"],
        "treatment": {
            "organic": ["Remove and destroy infected leaves", "Neem oil spray (5ml/L)", "Copper-based fungicide"],
            "chemical": ["Mancozeb 75% WP (2g/L)", "Chlorothalonil (2g/L)", "Azoxystrobin fungicide"],
        },
        "prevention": [
            "Practice crop rotation (3-year cycle)",
            "Use disease-resistant varieties",
            "Avoid overhead irrigation – use drip",
            "Maintain proper plant spacing",
        ],
    },
    "late blight": {
        "display": "Late Blight",
        "description": "A destructive oomycete disease caused by Phytophthora infestans, responsible for the Irish Potato Famine.",
        "symptoms": [
            "Water-soaked pale green lesions on leaves",
            "White mold on underside of leaves in humid conditions",
            "Dark brown lesions on stems",
            "Rapid collapse of entire plant in wet weather",
        ],
        "causes": ["Phytophthora infestans oomycete", "Cool wet weather (10–20°C)", "High humidity above 90%"],
        "treatment": {
            "organic": ["Remove infected plants immediately", "Copper hydroxide spray", "Avoid overhead watering"],
            "chemical": ["Metalaxyl + Mancozeb (2.5g/L)", "Cymoxanil + Mancozeb", "Dimethomorph fungicide"],
        },
        "prevention": [
            "Plant certified disease-free seed tubers",
            "Use resistant varieties",
            "Apply preventive fungicide before disease onset",
            "Ensure good field drainage",
        ],
    },
    "leaf scald": {
        "display": "Leaf Scald",
        "description": "A bacterial disease of sugarcane and rice causing scalded appearance on leaf margins.",
        "symptoms": [
            "Pale yellow to white stripes along leaf margins",
            "Scalded or bleached appearance",
            "Lesions spread from tip to base",
        ],
        "causes": ["Xanthomonas albilineans bacteria", "Infected planting material", "High temperature and humidity"],
        "treatment": {
            "organic": ["Hot water treatment of seed material (50°C for 2 hours)", "Remove infected ratoons"],
            "chemical": ["Copper-based bactericide spray", "Streptomycin sulfate treatment"],
        },
        "prevention": [
            "Use disease-free planting material",
            "Disinfect cutting tools between plants",
            "Avoid mechanical injury to plants",
        ],
    },
    "healthy": {
        "display": "Healthy Plant",
        "description": "No disease detected. The plant appears healthy with no visible signs of infection.",
        "symptoms": ["No disease symptoms detected"],
        "causes": [],
        "treatment": {
            "organic": ["Continue regular monitoring", "Maintain good agronomic practices"],
            "chemical": [],
        },
        "prevention": [
            "Continue regular crop scouting",
            "Maintain balanced fertilization",
            "Ensure proper irrigation management",
            "Practice crop rotation",
        ],
    },
    "pest infestation": {
        "display": "Pest Infestation",
        "description": "Insect or pest damage detected on the plant. Caterpillars, aphids, or other pests are causing visible leaf damage including holes, chewing marks, or defoliation.",
        "symptoms": [
            "Irregular holes or chewed edges on leaves",
            "Visible insects, larvae, or caterpillars on plant",
            "Sticky residue or honeydew on leaves (aphids)",
            "Wilting or distorted new growth",
            "Frass (insect droppings) on leaves or soil",
        ],
        "causes": [
            "Caterpillar or larval feeding (Lepidoptera)",
            "Aphid or whitefly infestation",
            "Beetle or grasshopper damage",
            "Mite infestation in dry conditions",
        ],
        "treatment": {
            "organic": [
                "Hand-pick and destroy visible insects and egg masses",
                "Spray neem oil solution (5ml/L water) every 7 days",
                "Apply Bacillus thuringiensis (Bt) for caterpillar control",
                "Introduce natural predators (ladybugs, parasitic wasps)",
            ],
            "chemical": [
                "Chlorpyrifos 20 EC (2ml/L) for soil pests",
                "Imidacloprid 17.8 SL (0.5ml/L) for sucking pests",
                "Lambda-cyhalothrin for caterpillar control",
            ],
        },
        "prevention": [
            "Regular crop scouting — inspect undersides of leaves",
            "Use yellow sticky traps to monitor flying insects",
            "Maintain field hygiene — remove crop debris after harvest",
            "Use pheromone traps for moth/butterfly pest monitoring",
            "Practice crop rotation to break pest cycles",
        ],
    },
}


def get_soil_info(raw_label: str) -> dict:
    """Look up soil knowledge by label (case-insensitive, fuzzy match)."""
    label = raw_label.lower().replace("_", " ").strip()
    # Direct match
    if label in SOIL_KNOWLEDGE:
        return SOIL_KNOWLEDGE[label]
    # Partial match
    for key, val in SOIL_KNOWLEDGE.items():
        if key in label or label in key:
            return val
    # Fallback
    return {
        "display": raw_label.replace("_", " ").title(),
        "properties": {
            "drainage": "Unknown",
            "fertility": "Unknown",
            "water_retention": "Unknown",
            "texture": "Unknown",
            "ph_range": "Unknown",
        },
        "recommendations": {
            "crops": ["Consult local agricultural extension officer"],
            "fertilizer": "Conduct soil test for specific recommendations.",
            "irrigation": "Monitor soil moisture and irrigate as needed.",
            "improvement_tips": ["Conduct a detailed soil test for tailored advice"],
        },
    }


def get_disease_info(raw_label: str) -> dict:
    """Look up disease knowledge by label (case-insensitive, fuzzy match)."""
    label = raw_label.lower().replace("_", " ").strip()
    if label in DISEASE_KNOWLEDGE:
        return DISEASE_KNOWLEDGE[label]
    for key, val in DISEASE_KNOWLEDGE.items():
        if key in label or label in key:
            return val
    # Fallback for unknown disease
    return {
        "display": raw_label.replace("_", " ").title(),
        "description": "Disease identified by AI model. Consult your local agricultural extension officer for detailed advice.",
        "symptoms": ["Visible abnormalities on plant tissue"],
        "causes": ["Pathogen infection (fungal, bacterial, or viral)"],
        "treatment": {
            "organic": ["Remove and destroy infected plant material", "Apply neem-based spray as a general measure"],
            "chemical": ["Consult local agronomist for specific fungicide/bactericide recommendation"],
        },
        "prevention": [
            "Use certified disease-free seeds",
            "Practice crop rotation",
            "Maintain field hygiene",
            "Monitor crops regularly",
        ],
    }


def get_weather_advice(temperature: float, humidity: int, description: str, wind_speed: float) -> list:
    """Generate agricultural advice based on weather conditions."""
    advice = []
    desc = description.lower()

    if humidity > 80:
        advice.append("High humidity increases risk of fungal diseases — consider preventive fungicide spray.")
    elif humidity < 40:
        advice.append("Low humidity — monitor crops for drought stress and increase irrigation frequency.")

    if temperature > 35:
        advice.append("Extreme heat — irrigate early morning or evening to reduce evaporation and heat stress.")
    elif temperature < 15:
        advice.append("Cool temperatures may slow crop growth — protect sensitive crops from cold stress.")
    elif 25 <= temperature <= 32:
        advice.append("Optimal temperature range for most field crops.")

    if "rain" in desc or "drizzle" in desc:
        advice.append("Rain expected — delay pesticide application to avoid washoff.")
        advice.append("Ensure field drainage is clear to prevent waterlogging.")
    elif "clear" in desc or "sunny" in desc:
        advice.append("Clear conditions — good day for pesticide or fertilizer application.")

    if wind_speed > 20:
        advice.append("High winds — avoid spraying pesticides to prevent drift.")
    elif wind_speed < 5:
        advice.append("Low wind speed — ideal conditions for foliar spray application.")

    if not advice:
        advice.append("Weather conditions are moderate — continue normal farming activities.")

    return advice
