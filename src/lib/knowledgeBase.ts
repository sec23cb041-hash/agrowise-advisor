// ── Frontend farming knowledge base (offline fallback) ────────────────────────

export const farmingKnowledge = [
  {
    keywords: ["rice", "fertilizer"],
    answer: "For rice cultivation apply Urea (120 kg/ha), DAP (60 kg/ha), and Potash (40 kg/ha). Apply nitrogen fertilizer in 3 split doses for best yield.",
  },
  {
    keywords: ["cotton", "pest"],
    answer: "To control pests in cotton use Neem oil spray or Imidacloprid insecticide. Maintain proper field sanitation.",
  },
  {
    keywords: ["plant", "tomato"],
    answer: "Tomatoes grow best when soil temperature is above 18°C. Ideal planting seasons in India are June–July and October–November.",
  },
  {
    keywords: ["rice", "blast"],
    answer: "Rice blast disease can be managed using resistant varieties and spraying Tricyclazole fungicide.",
  },
  {
    keywords: ["wheat", "irrigation"],
    answer: "Wheat irrigation should be done at crown root initiation, tillering, booting, and grain filling stages.",
  },
  {
    keywords: ["rice", "disease"],
    answer: "Common rice diseases include blast, sheath blight, and bacterial leaf blight. Use Tricyclazole for blast and Hexaconazole for sheath blight.",
  },
  {
    keywords: ["cotton", "fertilizer"],
    answer: "For cotton apply NPK 120:60:60 kg/ha. Apply gypsum (400 kg/ha) on black soils. Boron spray (0.2%) at flowering improves boll setting.",
  },
  {
    keywords: ["wheat", "fertilizer"],
    answer: "For wheat apply DAP (100 kg/ha) as basal dose and Urea (120 kg/ha) in 2 splits at crown root and tillering stages.",
  },
  {
    keywords: ["tomato", "fertilizer"],
    answer: "For tomato apply FYM (25 t/ha) before planting. NPK 150:75:75 kg/ha in splits. Calcium nitrate spray prevents blossom end rot.",
  },
  {
    keywords: ["rice", "irrigation"],
    answer: "Rice requires 1200–2000 mm water. Maintain 5 cm standing water during vegetative stage. Drain field 10 days before harvest.",
  },
  {
    keywords: ["tomato", "pest"],
    answer: "For tomato pests use Bt spray for fruit borer and Imidacloprid for leaf miner. Use pheromone traps for monitoring.",
  },
  {
    keywords: ["soil"],
    answer: "Conduct a soil test every 2–3 years. Maintain soil pH between 6.0–7.5 for most crops. Add organic matter to improve soil health.",
  },
  {
    keywords: ["fertilizer"],
    answer: "Apply a balanced NPK fertilizer based on soil test results. Generally NPK 120:60:40 kg/ha is recommended for most crops. Add organic compost (5–10 t/ha) to improve soil health.",
  },
  {
    keywords: ["pest"],
    answer: "For pest control identify the pest first. Use neem oil (5 ml/L) as a safe organic option. For severe infestations consult your local agricultural extension officer.",
  },
  {
    keywords: ["irrigation"],
    answer: "Irrigate based on crop stage and soil moisture. Drip irrigation is most efficient. Avoid waterlogging and irrigate in the morning or evening.",
  },
  {
    keywords: ["disease"],
    answer: "For disease management remove infected plant parts, improve air circulation, and avoid overhead irrigation. Apply appropriate fungicide based on disease type.",
  },
];

export function getLocalAdvice(question: string): string {
  const q = question.toLowerCase();
  for (const item of farmingKnowledge) {
    if (item.keywords.every((k) => q.includes(k))) {
      return item.answer;
    }
  }
  return "Please provide more details about your crop problem so I can give better farming advice.";
}
