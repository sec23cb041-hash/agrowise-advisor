const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Weather ──────────────────────────────────────────────────────────────────

export interface WeatherResult {
  city: string;
  temperature: number;
  humidity: number;
  description: string;
  wind_speed: number;
  rainfall?: number;
  advice: string[];
}

// ── Soil ─────────────────────────────────────────────────────────────────────

export interface SoilProperties {
  drainage: string;
  fertility: string;
  water_retention: string;
  texture: string;
  ph_range: string;
}

export interface SoilRecommendations {
  crops: string[];
  fertilizer: string;
  irrigation: string;
  improvement_tips: string[];
}

export interface SoilParameters {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
}

export interface EnvironmentConditions {
  temperature: number;
  humidity: number;
  moisture: number;
  rainfall: number;
}

export interface SoilResult {
  soil_type: string;
  confidence: number;
  certainty: string;
  properties: SoilProperties;
  recommendations: SoilRecommendations;
  soil_parameters?: SoilParameters;
  environment?: EnvironmentConditions;
}

// ── Disease ───────────────────────────────────────────────────────────────────

export interface DiseaseTreatment {
  organic: string[];
  chemical: string[];
}

export interface DiseaseResult {
  disease: string;
  confidence: number;
  certainty: string;
  description: string;
  symptoms: string[];
  causes: string[];
  treatment: DiseaseTreatment;
  prevention: string[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function fetchWeather(city: string): Promise<WeatherResult> {
  const res = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch weather");
  return data;
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherResult> {
  const res = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch weather");
  return data;
}

export interface MarketAlert {
  id: number;
  message: string;
  time: string;
  severity: string;
}

export interface MarketAlertsResult {
  alerts: number;
  latest: string;
  items: MarketAlert[];
}

export async function fetchMarketAlerts(): Promise<MarketAlertsResult> {
  const res = await fetch(`${API_BASE_URL}/market-alerts`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch market alerts");
  return data;
}

export async function predictCropDisease(file: File): Promise<DiseaseResult> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_BASE_URL}/predict-crop-disease`, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Prediction failed");
  return data;
}

export async function predictSoilType(file: File, lat?: number, lon?: number): Promise<SoilResult> {
  const form = new FormData();
  form.append("image", file);
  let url = `${API_BASE_URL}/predict-soil-type`;
  if (lat !== undefined && lon !== undefined) {
    url += `?lat=${lat}&lon=${lon}`;
  }
  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Prediction failed");
  return data;
}

// ── Crop Recommendation ───────────────────────────────────────────────────────

export interface CropRecommendRequest {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  temperature: number;
  rainfall: number;
  humidity?: number;
  last_crop?: string;
}

export interface CropRecommendResult {
  predicted_crop: string | null;
  confidence: number | null;
  soil_analysis: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    moisture: string;
  };
  environment: {
    temperature: number;
    rainfall: number;
  };
  recommended_crops: string[];
  secondary_crops: string[];
  fertilizer_recommendation: string[];
  irrigation_advice: string;
  soil_health_tips: string[];
  crop_rotation: string;
  rotation_suggestion: string;
}

export interface DatasetStats {
  total_samples: number;
  avg_nitrogen: number;
  avg_phosphorus: number;
  avg_potassium: number;
  avg_temperature: number;
  avg_humidity: number;
  avg_moisture: number;
  top_crops: { crop: string; count: number }[];
  unique_crops: number;
  unique_soil_types: number;
}

export async function recommendCrop(params: CropRecommendRequest): Promise<CropRecommendResult> {
  const res = await fetch(`${API_BASE_URL}/recommend-crop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Recommendation failed");
  return data;
}

export async function fetchDatasetStats(): Promise<DatasetStats> {
  const res = await fetch(`${API_BASE_URL}/recommend-crop/dataset-stats`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch dataset stats");
  return data;
}

// ── Weather AI ────────────────────────────────────────────────────────────────

const ML_BASE_URL = import.meta.env.VITE_ML_BASE_URL || "http://localhost:8000";

export interface WeatherAIForecastDay {
  day: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  cloud_cover: number;
  will_rain: boolean;
  rain_probability: number;
  rainfall_mm: number;
}

export interface WeatherAICropAlert {
  level: "low" | "medium" | "high";
  message: string;
}

export interface WeatherAIResult {
  city: string;
  country: string;
  description: string;
  current: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    cloud_cover: number;
    pressure: number;
    rainfall_1h: number;
  };
  ai_prediction: {
    will_rain: boolean;
    rain_probability: number;
    predicted_rainfall_mm: number;
  };
  forecast: WeatherAIForecastDay[];
  crop_risk_alerts: WeatherAICropAlert[];
}

export async function fetchWeatherAI(
  city?: string,
  lat?: number,
  lon?: number
): Promise<WeatherAIResult> {
  let url = `${ML_BASE_URL}/weather-ai?`;
  if (city) url += `city=${encodeURIComponent(city)}`;
  else if (lat !== undefined && lon !== undefined) url += `lat=${lat}&lon=${lon}`;
  else throw new Error("Provide city or coordinates");

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Weather AI failed");
  return data;
}

// ── Voice Advisory ────────────────────────────────────────────────────────────

import { getLocalAdvice } from "./knowledgeBase";

export interface VoiceAdviceResult {
  question: string;
  answer: string;
}

export async function fetchVoiceAdvice(question: string, lang = "en-US"): Promise<VoiceAdviceResult> {
  try {
    const res = await fetch(`${ML_BASE_URL}/voice-advisory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lang }),
    });
    if (!res.ok) {
      return { question, answer: getLocalAdvice(question) };
    }
    return await res.json();
  } catch {
    // Network unavailable — answer locally
    return { question, answer: getLocalAdvice(question) };
  }
}
