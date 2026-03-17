// Market prices are fetched via the Node backend proxy (/market-prices)
// to avoid CORS issues when calling api.data.gov.in from the browser.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface MandiRecord {
  commodity: string;
  market: string;
  state: string;
  modal_price: string;
  min_price: string;
  max_price: string;
  arrival_date: string;
}

export const FALLBACK_PRICES: MandiRecord[] = [
  { commodity: "Rice",      market: "Coimbatore Mandi",  state: "Tamil Nadu", modal_price: "2150", min_price: "2050", max_price: "2250", arrival_date: "Today" },
  { commodity: "Wheat",     market: "Chennai Market",    state: "Tamil Nadu", modal_price: "2350", min_price: "2280", max_price: "2420", arrival_date: "Today" },
  { commodity: "Cotton",    market: "Erode Mandi",       state: "Tamil Nadu", modal_price: "6200", min_price: "6100", max_price: "6350", arrival_date: "Today" },
  { commodity: "Tomato",    market: "Mettupalayam",      state: "Tamil Nadu", modal_price: "980",  min_price: "900",  max_price: "1050", arrival_date: "Today" },
  { commodity: "Onion",     market: "Oddanchatram",      state: "Tamil Nadu", modal_price: "1800", min_price: "1700", max_price: "1900", arrival_date: "Today" },
  { commodity: "Sugarcane", market: "Coimbatore",        state: "Tamil Nadu", modal_price: "3100", min_price: "3000", max_price: "3200", arrival_date: "Today" },
];

export async function fetchMarketPrices(crop: string): Promise<MandiRecord[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/market-prices?commodity=${encodeURIComponent(crop)}`
    );
    if (!res.ok) throw new Error("Backend error");
    const data = await res.json();
    if (!data.records || data.records.length === 0) throw new Error("No records");
    return data.records as MandiRecord[];
  } catch {
    const fallback = FALLBACK_PRICES.filter(
      (r) => r.commodity.toLowerCase() === crop.toLowerCase()
    );
    return fallback.length ? fallback : [];
  }
}

export async function fetchDefaultCrops(): Promise<MandiRecord[]> {
  const crops = ["Rice", "Wheat", "Cotton", "Tomato", "Onion", "Sugarcane"];
  const results = await Promise.all(crops.map((c) => fetchMarketPrices(c)));
  return results
    .map((records, i) => records[0] ?? FALLBACK_PRICES.find((f) => f.commodity === crops[i])!)
    .filter(Boolean);
}
