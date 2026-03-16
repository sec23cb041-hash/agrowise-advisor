import { useState } from "react";
import {
  ArrowLeft, Sprout, Droplets, FlaskConical, Leaf, RotateCcw,
  Loader2, AlertTriangle, CheckCircle, Thermometer, CloudRain, Wind,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { recommendCrop, type CropRecommendResult } from "@/lib/api";

const EMPTY_FORM = {
  nitrogen: "", phosphorus: "", potassium: "",
  ph: "", moisture: "", temperature: "", rainfall: "", humidity: "",
  last_crop: "",
};

function NutrientBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Field({ label, unit, value, onChange }: { label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
        {label} <span className="text-muted-foreground/60">({unit})</span>
      </label>
      <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm" />
    </div>
  );
}

function ConfidenceRing({ pct }: { pct: number }) {
  const color = pct >= 80 ? "text-success" : pct >= 60 ? "text-accent" : "text-destructive";
  return (
    <div className={`text-4xl font-bold tabular-nums ${color}`}>{pct}%</div>
  );
}

export default function CropRecommendationPage() {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CropRecommendResult | null>(null);

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleAnalyze = async () => {
    // Validate required fields
    const required = ["nitrogen", "phosphorus", "potassium", "ph", "temperature", "humidity", "moisture", "rainfall"] as const;
    const missing = required.filter((k) => form[k].trim() === "" || isNaN(Number(form[k])));
    if (missing.length > 0) {
      setError("Please fill all soil parameters before analyzing.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await recommendCrop({
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        ph: Number(form.ph),
        moisture: Number(form.moisture),
        temperature: Number(form.temperature),
        rainfall: Number(form.rainfall),
        humidity: Number(form.humidity),
        last_crop: form.last_crop,
      });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ ...EMPTY_FORM });
    setResult(null);
    setError(null);
  };

  const chartData = result ? [
    { name: "N", value: result.soil_analysis.nitrogen, fill: "#22c55e" },
    { name: "P", value: result.soil_analysis.phosphorus, fill: "#f59e0b" },
    { name: "K", value: result.soil_analysis.potassium, fill: "#3b82f6" },
  ] : [];

  const confPct = result?.confidence != null ? Math.round(result.confidence * 100) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Crop Recommendation</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">AI-powered crop advice from soil & environment data</p>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-8">
        {/* ── SECTION 1: Input form ── */}
        <Card className="shadow-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-accent" />
                <span className="text-sm font-bold">Soil Parameters</span>
              </div>
              <button onClick={handleReset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nitrogen (N)" unit="kg/ha" value={form.nitrogen} onChange={set("nitrogen")} />
              <Field label="Phosphorus (P)" unit="kg/ha" value={form.phosphorus} onChange={set("phosphorus")} />
              <Field label="Potassium (K)" unit="kg/ha" value={form.potassium} onChange={set("potassium")} />
              <Field label="pH" unit="0–14" value={form.ph} onChange={set("ph")} />
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2 mb-3">
                <CloudRain className="h-4 w-4 text-info" />
                <span className="text-sm font-bold">Environment</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Temperature" unit="°C" value={form.temperature} onChange={set("temperature")} />
                <Field label="Humidity" unit="%" value={form.humidity} onChange={set("humidity")} />
                <Field label="Moisture" unit="%" value={form.moisture} onChange={set("moisture")} />
                <Field label="Rainfall" unit="mm" value={form.rainfall} onChange={set("rainfall")} />
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Last Crop <span className="text-muted-foreground/60">(optional)</span>
                  </label>
                  <Input value={form.last_crop} onChange={(e) => set("last_crop")(e.target.value)} placeholder="e.g. wheat" className="h-9 text-sm" />
                </div>
              </div>
            </div>
            <Button variant="hero" className="w-full" onClick={handleAnalyze} disabled={loading}>
              {loading
                ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</>
                : <><Sprout className="h-5 w-5" /> Analyze Soil & Recommend Crops</>}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-2xl bg-destructive/10 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <span className="text-sm text-destructive font-semibold">{error}</span>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">

            {/* ── SECTION 2: ML Predicted Crop ── */}
            {result.predicted_crop && (
              <Card className="shadow-card border-success/40">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <h3 className="text-sm font-bold">🌾 AI Predicted Crop</h3>
                  </div>
                  <div className="rounded-2xl bg-success/10 p-5 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-success">{result.predicted_crop}</div>
                      <div className="text-xs text-muted-foreground mt-1">Best match from trained model</div>
                    </div>
                    {confPct !== null && (
                      <div className="flex flex-col items-center">
                        <ConfidenceRing pct={confPct} />
                        <div className="text-xs text-muted-foreground mt-1">Confidence</div>
                      </div>
                    )}
                  </div>
                  {confPct !== null && (
                    <div className="mt-3">
                      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${confPct >= 80 ? "bg-success" : confPct >= 60 ? "bg-accent" : "bg-destructive"}`}
                          style={{ width: `${confPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── SECTION 3: Rule-based crop lists ── */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sprout className="h-5 w-5 text-success" />
                  <h3 className="text-sm font-bold">🌾 Crop Recommendations</h3>
                </div>
                {result.recommended_crops.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-bold text-success uppercase tracking-wide mb-2">Primary Crops</div>
                    <div className="flex flex-wrap gap-2">
                      {result.recommended_crops.map((c) => (
                        <Badge key={c} className="bg-success/15 text-success border-0 px-3 py-1">
                          <Sprout className="h-3 w-3 mr-1" />{c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {result.secondary_crops.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-info uppercase tracking-wide mb-2">Secondary Crops</div>
                    <div className="flex flex-wrap gap-2">
                      {result.secondary_crops.map((c) => (
                        <Badge key={c} className="bg-info/15 text-info border-0 px-3 py-1">
                          <Leaf className="h-3 w-3 mr-1" />{c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── SECTION 4: Soil analysis + NPK chart ── */}
            <Card className="shadow-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold">🌱 Soil Analysis</h3>
                </div>
                <NutrientBar label="Nitrogen (N)" value={result.soil_analysis.nitrogen} max={140} color="bg-success" />
                <NutrientBar label="Phosphorus (P)" value={result.soil_analysis.phosphorus} max={100} color="bg-accent" />
                <NutrientBar label="Potassium (K)" value={result.soil_analysis.potassium} max={200} color="bg-info" />
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
                    <span className="text-xs font-semibold text-muted-foreground">pH</span>
                    <span className="text-sm font-bold">{result.soil_analysis.ph}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
                    <span className="text-xs font-semibold text-muted-foreground">Moisture</span>
                    <span className="text-sm font-bold">{result.soil_analysis.moisture}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">NPK Chart</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={chartData} barSize={44}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: number) => [`${v} kg/ha`]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Environment */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CloudRain className="h-5 w-5 text-info" />
                  <h3 className="text-sm font-bold">Environment Conditions</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center rounded-xl bg-secondary p-3">
                    <Thermometer className="h-5 w-5 text-accent mb-1" />
                    <div className="text-xs text-muted-foreground">Temperature</div>
                    <div className="text-sm font-bold">{result.environment.temperature}°C</div>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-secondary p-3">
                    <CloudRain className="h-5 w-5 text-info mb-1" />
                    <div className="text-xs text-muted-foreground">Rainfall</div>
                    <div className="text-sm font-bold">{result.environment.rainfall} mm</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── SECTION 5: Fertilizer ── */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold">🧪 Fertilizer Suggestions</h3>
                </div>
                <ul className="space-y-2">
                  {result.fertilizer_recommendation.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground rounded-xl bg-accent/5 p-3">
                      <span className="text-accent mt-0.5 shrink-0">•</span>{tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* ── SECTION 6: Irrigation ── */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-info" />
                  <h3 className="text-sm font-bold">💧 Irrigation Advice</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed rounded-xl bg-info/5 p-3">{result.irrigation_advice}</p>
              </CardContent>
            </Card>

            {/* ── SECTION 7: Crop rotation ── */}
            {result.crop_rotation && (
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <RotateCcw className="h-5 w-5 text-accent" />
                    <h3 className="text-sm font-bold">Crop Rotation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.crop_rotation}</p>
                  {result.rotation_suggestion && (
                    <div className="mt-2">
                      <Badge className="bg-accent/15 text-accent border-0 px-3 py-1">
                        <Sprout className="h-3 w-3 mr-1" />Next: {result.rotation_suggestion}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── SECTION 8: Soil health tips ── */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="h-5 w-5 text-success" />
                  <h3 className="text-sm font-bold">🌱 Soil Health Tips</h3>
                </div>
                <ul className="space-y-2">
                  {result.soil_health_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-success mt-0.5">•</span>{tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

          </motion.div>
        )}
      </div>
    </div>
  );
}
