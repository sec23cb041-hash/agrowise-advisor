// ── data.gov.in Agmarknet API ─────────────────────────────────────────────────
// Resource: 9ef84268-d588-465a-a308-a864a43d0070 (Daily Mandi Prices)

const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad38d07d09a624f9b";
const BASE_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

export interface MandiRecord {
  commodity: string;
  market: string;
  state: string;
  modal_price: string;
  min_price: string;
  max_price: string;
  arrival_date: string;
}

// ── Fallback static prices (shown when API is unavailable) ────────────────────

export const FALLBACK_PRICES: MandiRecord[] = [
  { commodity: "Rice",      market: "Coimbatore Mandi",  state: "Tamil Nadu",    modal_price: "2150", min_price: "2050", max_price: "2250", arrival_date: "Today" },
  { commodity: "Wheat",     market: "Chennai Market",    state: "Tamil Nadu",    modal_price: "2350", min_price: "2280", max_price: "2420", arrival_date: "Today" },
  { commodity: "Cotton",    market: "Erode Mandi",       state: "Tamil Nadu",    modal_price: "6200", min_price: "6100", max_price: "6350", arrival_date: "Today" },
  { commodity: "Tomato",    market: "Mettupalayam",      state: "Tamil Nadu",    modal_price: "980",  min_price: "900",  max_price: "1050", arrival_date: "Today" },
  { commodity: "Onion",     market: "Oddanchatram",      state: "Tamil Nadu",    modal_price: "1800", min_price: "1700", max_price: "1900", arrival_date: "Today" },
  { commodity: "Sugarcane", market: "Coimbatore",        state: "Tamil Nadu",    modal_price: "3100", min_price: "3000", max_price: "3200", arrival_date: "Today" },
];

export async function fetchMarketPrices(crop: string): Promise<MandiRecord[]> {
  try {
    const url =
      `${BASE_URL}?api-key=${API_KEY}&format=json&limit=5` +
      `&filters[commodity]=${encodeURIComponent(crop)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (!data.records || data.records.length === 0) throw new Error("No records");
    return data.records as MandiRecord[];
  } catch {
    // Return matching fallback entry so the page never appears empty
    const fallback = FALLBACK_PRICES.filter(
      (r) => r.commodity.toLowerCase() === crop.toLowerCase()
    );
    return fallback.length ? fallback : [];
  }
}

export async function fetchDefaultCrops(): Promise<MandiRecord[]> {
  const crops = ["Rice", "Wheat", "Cotton", "Tomato", "Onion", "Sugarcane"];
  const results = await Promise.all(crops.map((c) => fetchMarketPrices(c)));
  // Take best (first) record per crop
  return results
    .map((records, i) => records[0] ?? FALLBACK_PRICES.find((f) => f.commodity === crops[i])!)
    .filter(Boolean);
}
