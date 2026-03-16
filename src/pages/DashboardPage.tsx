import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Sun, MapPin, Bell, Globe, Droplets, Thermometer, Leaf, AlertTriangle,
  FlaskConical, Camera, Mic, CloudSun, TrendingUp, ShieldAlert, Sprout,
  BarChart2, LayoutDashboard, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fetchWeatherByCoords, fetchMarketAlerts, type MarketAlert } from "@/lib/api";

const languages = ["EN", "தமிழ்", "हिंदी"];

const featureCards = [
  { icon: FlaskConical, title: "Soil Health & Fertilizer", desc: "Check soil status and get fertilizer advice", path: "/soil", bg: "bg-success/10", iconColor: "text-success" },
  { icon: Camera, title: "Pest & Disease Detection", desc: "Upload crop photo for AI diagnosis", path: "/pest", bg: "bg-accent/10", iconColor: "text-accent" },
  { icon: Mic, title: "Voice Advisory", desc: "Tap to speak in your language", path: "/voice", bg: "bg-info/10", iconColor: "text-info" },
  { icon: CloudSun, title: "Weather Alerts", desc: "Today's forecast and crop safety tips", path: "/weather", bg: "bg-info/10", iconColor: "text-info" },
  { icon: TrendingUp, title: "Market Prices", desc: "Live crop prices from nearby markets", path: "/market", bg: "bg-accent/10", iconColor: "text-accent" },
  { icon: ShieldAlert, title: "Smart Alerts", desc: "Emergency notifications and reminders", path: "/alerts", bg: "bg-destructive/10", iconColor: "text-destructive" },
  { icon: Sprout, title: "Crop Recommendation AI", desc: "ML-powered crop suggestions from soil data", path: "/crop-recommend", bg: "bg-success/10", iconColor: "text-success" },
  { icon: BarChart2, title: "Dataset Insights", desc: "Explore crop dataset statistics and charts", path: "/dataset-insights", bg: "bg-info/10", iconColor: "text-info" },
  { icon: LayoutDashboard, title: "Smart Farm Dashboard", desc: "All AI modules in one unified view", path: "/smart-farm", bg: "bg-primary/10", iconColor: "text-primary" },
];

interface LastScan { health: string; confidence: number }
interface LocationState { city: string; state: string; lat: number | null; lon: number | null }

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; state: string }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  const addr = data.address ?? {};
  const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? "Unknown";
  const state = addr.state ?? "";
  return { city, state };
}

export default function DashboardPage() {
  const [lang, setLang] = useState(0);
  const [location, setLocation] = useState<LocationState>({ city: "Detecting...", state: "", lat: null, lon: null });
  const [temperature, setTemperature] = useState<string>("--");
  const [humidity, setHumidity] = useState<number | null>(null);
  const [soilMoisture, setSoilMoisture] = useState<string>("--");
  const [cropHealth, setCropHealth] = useState<string>("--");
  const [marketAlertCount, setMarketAlertCount] = useState<number>(0);
  const [recentAlerts, setRecentAlerts] = useState<MarketAlert[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const w = await fetchWeatherByCoords(lat, lon);
      setTemperature(`${Math.round(w.temperature)}°C`);
      setHumidity(w.humidity);
      const rainfall = w.rainfall ?? 0;
      const moisture = Math.round(w.humidity * 0.6 + rainfall * 0.4);
      setSoilMoisture(`${moisture}%`);
    } catch {
      setTemperature("Unavailable");
      setSoilMoisture("--");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const loadMarketAlerts = useCallback(async () => {
    try {
      const data = await fetchMarketAlerts();
      setMarketAlertCount(data.alerts);
      setRecentAlerts(data.items);
    } catch {
      setMarketAlertCount(0);
    }
  }, []);

  useEffect(() => {
    // Read last scan from localStorage
    try {
      const raw = localStorage.getItem("lastScan");
      if (raw) {
        const scan: LastScan = JSON.parse(raw);
        setCropHealth(scan.health);
      } else {
        setCropHealth("No scan yet");
      }
    } catch {
      setCropHealth("No scan yet");
    }

    loadMarketAlerts();

    // GPS
    if (!navigator.geolocation) {
      setLocation({ city: "Coimbatore", state: "Tamil Nadu", lat: null, lon: null });
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const geo = await reverseGeocode(latitude, longitude);
          setLocation({ city: geo.city, state: geo.state, lat: latitude, lon: longitude });
        } catch {
          setLocation({ city: "Your Location", state: "", lat: latitude, lon: longitude });
        }
        loadWeather(latitude, longitude);
      },
      () => {
        // GPS denied — fallback to Coimbatore
        setLocation({ city: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lon: 76.9558 });
        loadWeather(11.0168, 76.9558);
      },
      { timeout: 10000 }
    );
  }, [loadWeather, loadMarketAlerts]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (location.lat && location.lon) {
        loadWeather(location.lat, location.lon);
        loadMarketAlerts();
      }
    }, 600_000);
    return () => clearInterval(interval);
  }, [location.lat, location.lon, loadWeather, loadMarketAlerts]);

  const quickStats = [
    { icon: Droplets, label: "SOIL MOISTURE", value: soilMoisture, color: "text-info" },
    { icon: Thermometer, label: "TEMPERATURE", value: weatherLoading ? "..." : temperature, color: "text-destructive" },
    { icon: Leaf, label: "CROP HEALTH", value: cropHealth, color: "text-success" },
    { icon: Bell, label: "MARKET ALERTS", value: marketAlertCount > 0 ? `${marketAlertCount} New` : "None", color: "text-accent" },
  ];

  const locationStr = location.state ? `${location.city}, ${location.state}` : location.city;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-5 pb-8 pt-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold text-primary-foreground">TechTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang((l) => (l + 1) % languages.length)}
              className="flex items-center gap-1 rounded-lg bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              aria-label="Change language"
            >
              <Globe className="h-3.5 w-3.5" />
              {languages[lang]}
            </button>
            <Link to="/alerts" className="relative" aria-label="Notifications">
              <Bell className="h-6 w-6 text-primary-foreground" />
              {marketAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {marketAlertCount}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Sun className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">Good Morning, Ravi!</h1>
            <div className="flex items-center gap-1 text-sm text-primary-foreground/70">
              <MapPin className="h-3.5 w-3.5" />
              {locationStr}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-6 pb-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <Card className="shadow-card border-border/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5">
                    {weatherLoading && (stat.label === "TEMPERATURE" || stat.label === "SOIL MOISTURE")
                      ? <Loader2 className={`h-5 w-5 ${stat.color} animate-spin`} />
                      : <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    }
                  </div>
                  <div>
                    <div className="text-xl font-bold tabular-nums">{stat.value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Cards */}
        <div>
          <h2 className="mb-3 text-lg font-bold">Farm Tools</h2>
          <div className="grid grid-cols-2 gap-3">
            {featureCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Link to={card.path}>
                  <Card className="shadow-card border-border/50 hover:shadow-card-hover transition-shadow h-full">
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.bg}`}>
                        <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                      <div>
                        <div className="text-sm font-bold leading-tight">{card.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{card.desc}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Recent Alerts</h2>
            <Link to="/alerts" className="text-sm font-semibold text-accent">View All</Link>
          </div>
          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts at the moment.</p>
            ) : (
              recentAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
                >
                  <Card className="shadow-card border-border/50">
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        alert.severity === "critical" ? "bg-destructive/10" : "bg-accent/10"
                      }`}>
                        {alert.severity === "critical"
                          ? <AlertTriangle className="h-5 w-5 text-destructive" />
                          : <TrendingUp className="h-5 w-5 text-accent" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-bold">{alert.message}</div>
                          <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
                            {alert.severity === "critical" ? "Critical" : "Info"}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">{alert.time}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
