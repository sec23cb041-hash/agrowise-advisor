import { useState } from "react";
import { ArrowLeft, MapPin, Droplets, Wind, Sun, Cloud, CloudRain, CloudSun, Search, Loader2, Sprout, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { fetchWeather, type WeatherResult } from "@/lib/api";

function getWeatherIcon(description: string) {
  const d = description.toLowerCase();
  if (d.includes("rain") || d.includes("drizzle")) return CloudRain;
  if (d.includes("cloud")) return d.includes("partly") ? CloudSun : Cloud;
  return Sun;
}

function getAdviceIcon(advice: string) {
  const a = advice.toLowerCase();
  if (a.includes("fungal") || a.includes("disease")) return AlertTriangle;
  if (a.includes("irrigat") || a.includes("water")) return Droplets;
  if (a.includes("wind") || a.includes("spray")) return Wind;
  return Sprout;
}

function getAdviceColor(advice: string) {
  const a = advice.toLowerCase();
  if (a.includes("fungal") || a.includes("disease") || a.includes("extreme")) return "bg-destructive/10 text-destructive";
  if (a.includes("optimal") || a.includes("ideal") || a.includes("good day")) return "bg-success/10 text-success";
  return "bg-info/10 text-info";
}

export default function WeatherPage() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WeatherResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchWeather(city.trim());
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const WeatherIcon = result ? getWeatherIcon(result.description) : Sun;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Weather Alerts</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">Live weather with farming advice</p>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-6">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name (e.g. Chennai)..."
                  className="pl-9"
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !city.trim()} className="shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Current weather card */}
            <Card className="shadow-card overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="font-semibold capitalize">{result.city}</span>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-5xl font-bold tabular-nums">{result.temperature.toFixed(1)}°C</div>
                    <div className="text-sm text-muted-foreground mt-1 capitalize">{result.description}</div>
                  </div>
                  <WeatherIcon className="h-16 w-16 text-accent" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center rounded-xl bg-secondary p-3">
                    <Droplets className="h-5 w-5 text-info mb-1" />
                    <div className="text-xs text-muted-foreground">Humidity</div>
                    <div className="text-sm font-bold tabular-nums">{result.humidity}%</div>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-secondary p-3">
                    <Wind className="h-5 w-5 text-accent mb-1" />
                    <div className="text-xs text-muted-foreground">Wind</div>
                    <div className="text-sm font-bold tabular-nums">{result.wind_speed} m/s</div>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-secondary p-3">
                    <Sun className="h-5 w-5 text-accent mb-1" />
                    <div className="text-xs text-muted-foreground">Condition</div>
                    <div className="text-xs font-bold capitalize text-center leading-tight">{result.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Farming advice */}
            {result.advice.length > 0 && (
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sprout className="h-5 w-5 text-success" />
                    <h3 className="text-sm font-bold">Farming Advice</h3>
                  </div>
                  <div className="space-y-2">
                    {result.advice.map((tip, i) => {
                      const Icon = getAdviceIcon(tip);
                      const colorClass = getAdviceColor(tip);
                      return (
                        <div key={i} className={`rounded-xl p-3 flex items-start gap-3 ${colorClass.split(" ")[0]}`}>
                          <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${colorClass.split(" ")[1]}`} />
                          <span className="text-sm leading-relaxed">{tip}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
