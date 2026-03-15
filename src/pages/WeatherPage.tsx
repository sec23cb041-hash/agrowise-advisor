import { ArrowLeft, MapPin, Droplets, Wind, Eye, CloudRain, Sun, Cloud, CloudSun, Umbrella, Sprout, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const forecast = [
  { day: "Mon", icon: Sun, high: 34, low: 24, label: "Sunny" },
  { day: "Tue", icon: CloudSun, high: 33, low: 23, label: "Partly" },
  { day: "Wed", icon: CloudRain, high: 28, low: 22, label: "Rain" },
  { day: "Thu", icon: CloudRain, high: 26, low: 21, label: "Heavy" },
  { day: "Fri", icon: Cloud, high: 29, low: 22, label: "Cloudy" },
  { day: "Sat", icon: Sun, high: 32, low: 23, label: "Sunny" },
  { day: "Sun", icon: Sun, high: 33, low: 24, label: "Clear" },
];

export default function WeatherPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Weather Alerts</h1>
        </div>
        <div className="flex items-center gap-1 text-sm text-primary-foreground/70">
          <MapPin className="h-3.5 w-3.5" /> Coimbatore, Tamil Nadu
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-6">
        {/* Today's Weather */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-card overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-1">Today</div>
                  <div className="text-5xl font-bold tabular-nums">32°C</div>
                  <div className="text-sm text-muted-foreground mt-1">Feels like 36°C</div>
                </div>
                <div className="flex flex-col items-center">
                  <Sun className="h-16 w-16 text-accent" />
                  <span className="text-sm font-semibold mt-1">Mostly Sunny</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { icon: Droplets, label: "Humidity", value: "65%" },
                  { icon: Wind, label: "Wind", value: "12 km/h" },
                  { icon: Umbrella, label: "Rain", value: "20%" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center rounded-xl bg-secondary p-3">
                    <s.icon className="h-5 w-5 text-info mb-1" />
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="text-sm font-bold tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 7-Day Forecast */}
        <div>
          <h2 className="text-lg font-bold mb-3">7-Day Forecast</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {forecast.map((d, i) => (
              <motion.div
                key={d.day}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="shrink-0"
              >
                <Card className={`shadow-card w-20 ${i === 0 ? "border-accent/50" : "border-border/50"}`}>
                  <CardContent className="flex flex-col items-center p-3 gap-1">
                    <span className={`text-xs font-bold ${i === 0 ? "text-accent" : ""}`}>{d.day}</span>
                    <d.icon className={`h-6 w-6 ${d.label === "Rain" || d.label === "Heavy" ? "text-info" : "text-accent"}`} />
                    <div className="text-sm font-bold tabular-nums">{d.high}°</div>
                    <div className="text-xs text-muted-foreground tabular-nums">{d.low}°</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alert Banners */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Alerts</h2>
          <div className="rounded-2xl bg-destructive/10 p-4 flex items-start gap-3">
            <CloudRain className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-destructive">Heavy Rain Warning</div>
              <div className="text-xs text-muted-foreground mt-0.5">Wednesday-Thursday: 80mm+ expected. Secure crops and drainage.</div>
            </div>
          </div>
          <div className="rounded-2xl bg-success/10 p-4 flex items-start gap-3">
            <Sprout className="h-6 w-6 text-success shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-success">Ideal Spraying Day</div>
              <div className="text-xs text-muted-foreground mt-0.5">Today: Low wind, no rain. Good conditions for pesticide application.</div>
            </div>
          </div>
          <div className="rounded-2xl bg-info/10 p-4 flex items-start gap-3">
            <Droplets className="h-6 w-6 text-info shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-info">Irrigation Reminder</div>
              <div className="text-xs text-muted-foreground mt-0.5">Soil moisture at 58%. Consider watering rice fields this evening.</div>
            </div>
          </div>
        </div>

        {/* Crop Calendar */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-bold">Crop Calendar Tip</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Based on weather forecast, <strong>best day to harvest: Saturday</strong>. Clear skies and low humidity will help with drying.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
