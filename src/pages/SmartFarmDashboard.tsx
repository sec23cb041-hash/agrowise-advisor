import { useState, useRef } from "react";
import {
  ArrowLeft, Sprout, Droplets, FlaskConical, Leaf, Loader2,
  AlertTriangle, CheckCircle, Thermometer, CloudRain, Camera,
  MapPin, Search, Bug, RotateCcw, Wind, Sun,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  recommendCrop, fetchWeather, predictCropDisease, predictSoilType,
  type CropRecommendResult, type WeatherResult, type DiseaseResult, type SoilResult,
} from "@/lib/api";

// ── Shared helpers ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color = "text-accent" }: { icon: React.ElementType; title: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`h-5 w-5 ${color}`} />
      <h3 className="text-sm font-bold">{title}</h3>
    </div>
  );
}

function ConfBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-success" : pct >= 60 ? "bg-accent" : "bg-destructive";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground font-semibold">{label ?? "Confidence"}</span>
        <span className="font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Default soil values ───────────────────────────────────────────────────────
const SOIL_DEMO = { nitrogen: 37, phosphorus: 0, potassium: 0, ph: 6.5, moisture: 38, temperature: 26, rainfall: 100, humidity: 52 };

export default function SmartFarmDashboard() {
  // ── Soil / Crop form ──────────────────────────────────────────────────────
  const [soilForm, setSoilForm] = useState({
    nitrogen: String(SOIL_DEMO.nitrogen), phosphorus: String(SOIL_DEMO.phosphorus),
    potassium: String(SOIL_DEMO.potassium), ph: String(SOIL_DEMO.ph),
    moisture: String(SOIL_DEMO.moisture), temperature: String(SOIL_DEMO.temperature),
    rainfall: String(SOIL_DEMO.rainfall), humidity: String(SOIL_DEMO.humidity),
  });
  const [cropLoading, setCropLoading] = useState(false);
  const [cropResult, setCropResult] = useState<CropRecommendResult | null>(null);
  const [cropError, setCropError] = useState<string | null>(null);

  // ── Weather ───────────────────────────────────────────────────────────────
  const [city, setCity] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherResult, setWeatherResult] = useState<WeatherResult | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // ── Disease detection ─────────────────────────────────────────────────────
  const [diseaseFile, setDiseaseFile] = useState<File | null>(null);
  const [diseasePreview, setDiseasePreview] = useState<string | null>(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState<DiseaseResult | null>(null);
  const [diseaseError, setDiseaseError] = useState<string | null>(null);
  const diseaseInputRef = useRef<HTMLInputElement>(null);

  // ── Soil image ────────────────────────────────────────────────────────────
  const [soilFile, setSoilFile] = useState<File | null>(null);
  const [soilPreview, setSoilPreview] = useState<string | null>(null);
  const [soilImgLoading, setSoilImgLoading] = useState(false);
  const [soilImgResult, setSoilImgResult] = useState<SoilResult | null>(null);
  const [soilImgError, setSoilImgError] = useState<string | null>(null);
  const soilInputRef = useRef<HTMLInputElement>(null);

  const setField = (k: string) => (v: string) => setSoilForm((f) => ({ ...f, [k]: v }));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCropAnalyze = async () => {
    setCropLoading(true); setCropError(null); setCropResult(null);
    try {
      const data = await recommendCrop({
        nitrogen: Number(soilForm.nitrogen), phosphorus: Number(soilForm.phosphorus),
        potassium: Number(soilForm.potassium), ph: Number(soilForm.ph),
        moisture: Number(soilForm.moisture), temperature: Number(soilForm.temperature),
        rainfall: Number(soilForm.rainfall), humidity: Number(soilForm.humidity),
      });
      setCropResult(data);
    } catch (e: unknown) { setCropError(e instanceof Error ? e.message : "Failed"); }
    finally { setCropLoading(false); }
  };

  const handleWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setWeatherLoading(true); setWeatherError(null); setWeatherResult(null);
    try { setWeatherResult(await fetchWeather(city.trim())); }
    catch (e: unknown) { setWeatherError(e instanceof Error ? e.message : "Failed"); }
    finally { setWeatherLoading(false); }
  };

  const handleDiseaseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setDiseaseFile(f); setDiseaseResult(null); setDiseaseError(null);
    setDiseasePreview(URL.createObjectURL(f));
  };

  const handleDiseaseDetect = async () => {
    if (!diseaseFile) return;
    setDiseaseLoading(true); setDiseaseError(null); setDiseaseResult(null);
    try { setDiseaseResult(await predictCropDisease(diseaseFile)); }
    catch (e: unknown) { setDiseaseError(e instanceof Error ? e.message : "Failed"); }
    finally { setDiseaseLoading(false); }
  };

  const handleSoilFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setSoilFile(f); setSoilImgResult(null); setSoilImgError(null);
    setSoilPreview(URL.createObjectURL(f));
  };

  const handleSoilAnalyze = async () => {
    if (!soilFile) return;
    setSoilImgLoading(true); setSoilImgError(null); setSoilImgResult(null);
    try { setSoilImgResult(await predictSoilType(soilFile)); }
    catch (e: unknown) { setSoilImgError(e instanceof Error ? e.message : "Failed"); }
    finally { setSoilImgLoading(false); }
  };

  const npkChart = cropResult ? [
    { name: "N", value: cropResult.soil_analysis.nitrogen, fill: "#22c55e" },
    { name: "P", value: cropResult.soil_analysis.phosphorus, fill: "#f59e0b" },
    { name: "K", value: cropResult.soil_analysis.potassium, fill: "#3b82f6" },
  ] : [];

  const isHealthy = diseaseResult?.disease.toLowerCase().includes("healthy");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Smart Farm Dashboard</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">All AI modules in one place</p>
      </div>

      <div className="px-5 -mt-4 space-y-5 pb-8">

        {/* ══ MODULE 2: Crop Recommendation ══ */}
        <Card className="shadow-card">
          <CardContent className="p-5 space-y-4">
            <SectionHeader icon={Sprout} title="🌾 Crop Recommendation AI" color="text-success" />

            {/* Soil inputs */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { k: "nitrogen", label: "N", unit: "kg/ha" },
                { k: "phosphorus", label: "P", unit: "kg/ha" },
                { k: "potassium", label: "K", unit: "kg/ha" },
                { k: "ph", label: "pH", unit: "" },
              ].map(({ k, label, unit }) => (
                <div key={k}>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">{label}{unit ? ` (${unit})` : ""}</label>
                  <Input type="number" value={soilForm[k as keyof typeof soilForm]} onChange={(e) => setField(k)(e.target.value)} className="h-8 text-xs px-2" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { k: "temperature", label: "Temp", unit: "°C" },
                { k: "humidity", label: "Humid", unit: "%" },
                { k: "moisture", label: "Moist", unit: "%" },
                { k: "rainfall", label: "Rain", unit: "mm" },
              ].map(({ k, label, unit }) => (
                <div key={k}>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">{label} ({unit})</label>
                  <Input type="number" value={soilForm[k as keyof typeof soilForm]} onChange={(e) => setField(k)(e.target.value)} className="h-8 text-xs px-2" />
                </div>
              ))}
            </div>

            <Button variant="hero" className="w-full h-9 text-sm" onClick={handleCropAnalyze} disabled={cropLoading}>
              {cropLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sprout className="h-4 w-4" /> Analyze & Recommend</>}
            </Button>

            {cropError && <p className="text-xs text-destructive font-semibold">{cropError}</p>}

            {cropResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {/* ML prediction */}
                {cropResult.predicted_crop && (
                  <div className="rounded-2xl bg-success/10 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-success">{cropResult.predicted_crop}</div>
                      <div className="text-xs text-muted-foreground">AI Predicted Crop</div>
                    </div>
                    {cropResult.confidence != null && (
                      <div className="text-2xl font-bold text-success tabular-nums">
                        {Math.round(cropResult.confidence * 100)}%
                      </div>
                    )}
                  </div>
                )}
                {cropResult.confidence != null && <ConfBar value={cropResult.confidence} label="Model Confidence" />}

                {/* NPK chart */}
                {npkChart.length > 0 && (
                  <ResponsiveContainer width="100%" height={110}>
                    <BarChart data={npkChart} barSize={36}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: number) => [`${v} kg/ha`]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {npkChart.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Primary crops */}
                {cropResult.recommended_crops.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-success uppercase tracking-wide mb-1">Primary Crops</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cropResult.recommended_crops.map((c) => (
                        <Badge key={c} className="bg-success/15 text-success border-0 text-xs"><Sprout className="h-2.5 w-2.5 mr-1" />{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {cropResult.secondary_crops.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-info uppercase tracking-wide mb-1">Secondary Crops</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cropResult.secondary_crops.map((c) => (
                        <Badge key={c} className="bg-info/15 text-info border-0 text-xs"><Leaf className="h-2.5 w-2.5 mr-1" />{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fertilizer */}
                <div className="rounded-xl bg-accent/5 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FlaskConical className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs font-bold">Fertilizer</span>
                  </div>
                  <ul className="space-y-1">
                    {cropResult.fertilizer_recommendation.map((t, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-accent shrink-0">•</span>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* Irrigation */}
                <div className="rounded-xl bg-info/5 p-3 flex items-start gap-2">
                  <Droplets className="h-4 w-4 text-info shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{cropResult.irrigation_advice}</p>
                </div>

                {/* Rotation */}
                {cropResult.crop_rotation && (
                  <div className="rounded-xl bg-secondary p-3 flex items-start gap-2">
                    <RotateCcw className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{cropResult.crop_rotation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* ══ MODULE 4: Weather ══ */}
        <Card className="shadow-card">
          <CardContent className="p-5 space-y-3">
            <SectionHeader icon={CloudRain} title="🌤 Weather Smart Farming" color="text-info" />
            <form onSubmit={handleWeather} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city…" className="pl-8 h-9 text-sm" disabled={weatherLoading} />
              </div>
              <Button type="submit" disabled={weatherLoading || !city.trim()} className="h-9 px-3">
                {weatherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>

            {weatherError && <p className="text-xs text-destructive font-semibold">{weatherError}</p>}

            {weatherResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="rounded-2xl bg-info/10 p-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />{weatherResult.city}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold tabular-nums">{weatherResult.temperature.toFixed(1)}°C</div>
                    <Sun className="h-10 w-10 text-accent" />
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mt-1">{weatherResult.description}</div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="flex flex-col items-center rounded-xl bg-background/60 p-2">
                      <Droplets className="h-4 w-4 text-info mb-0.5" />
                      <div className="text-[10px] text-muted-foreground">Humidity</div>
                      <div className="text-xs font-bold">{weatherResult.humidity}%</div>
                    </div>
                    <div className="flex flex-col items-center rounded-xl bg-background/60 p-2">
                      <Wind className="h-4 w-4 text-accent mb-0.5" />
                      <div className="text-[10px] text-muted-foreground">Wind</div>
                      <div className="text-xs font-bold">{weatherResult.wind_speed} m/s</div>
                    </div>
                    <div className="flex flex-col items-center rounded-xl bg-background/60 p-2">
                      <Thermometer className="h-4 w-4 text-destructive mb-0.5" />
                      <div className="text-[10px] text-muted-foreground">Feels</div>
                      <div className="text-xs font-bold">{weatherResult.temperature.toFixed(0)}°C</div>
                    </div>
                  </div>
                </div>
                {weatherResult.advice.length > 0 && (
                  <div className="space-y-1.5">
                    {weatherResult.advice.map((tip, i) => (
                      <div key={i} className="rounded-xl bg-secondary p-2.5 flex items-start gap-2">
                        <Sprout className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* ══ MODULE 3: Disease Detection ══ */}
        <Card className="shadow-card">
          <CardContent className="p-5 space-y-3">
            <SectionHeader icon={Bug} title="🔬 Plant Disease Detection" color="text-accent" />
            <input ref={diseaseInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleDiseaseFile} />
            <button
              onClick={() => diseaseInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-5 transition-colors hover:border-accent"
            >
              {diseasePreview ? (
                <div className="flex items-center gap-3">
                  <img src={diseasePreview} alt="Crop" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-success">{diseaseFile?.name}</div>
                    <div className="text-xs text-muted-foreground">Tap to change</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-8 w-8 text-accent" />
                  <div className="text-xs font-bold">Upload crop leaf photo</div>
                </div>
              )}
            </button>
            <Button variant="hero" className="w-full h-9 text-sm" onClick={handleDiseaseDetect} disabled={!diseaseFile || diseaseLoading}>
              {diseaseLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Detecting...</> : <><Camera className="h-4 w-4" /> Detect Disease</>}
            </Button>

            {diseaseError && <p className="text-xs text-destructive font-semibold">{diseaseError}</p>}

            {diseaseResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className={`rounded-2xl p-4 ${isHealthy ? "bg-success/10" : "bg-accent/10"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isHealthy ? <CheckCircle className="h-4 w-4 text-success" /> : <Bug className="h-4 w-4 text-accent" />}
                    <div className={`text-base font-bold ${isHealthy ? "text-success" : "text-accent"}`}>{diseaseResult.disease}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{diseaseResult.description}</div>
                </div>
                <ConfBar value={diseaseResult.confidence} />
                {!isHealthy && diseaseResult.symptoms.length > 0 && (
                  <div className="rounded-xl bg-secondary p-3">
                    <div className="text-xs font-bold mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-accent" />Symptoms
                    </div>
                    <ul className="space-y-1">
                      {diseaseResult.symptoms.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-accent shrink-0">•</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!isHealthy && (
                  <div className="grid grid-cols-2 gap-2">
                    {diseaseResult.treatment.organic.length > 0 && (
                      <div className="rounded-xl bg-success/5 p-3">
                        <div className="text-[10px] font-bold text-success uppercase mb-1">Organic</div>
                        {diseaseResult.treatment.organic.slice(0, 2).map((t, i) => (
                          <div key={i} className="text-xs text-muted-foreground">• {t}</div>
                        ))}
                      </div>
                    )}
                    {diseaseResult.treatment.chemical.length > 0 && (
                      <div className="rounded-xl bg-accent/5 p-3">
                        <div className="text-[10px] font-bold text-accent uppercase mb-1">Chemical</div>
                        {diseaseResult.treatment.chemical.slice(0, 2).map((t, i) => (
                          <div key={i} className="text-xs text-muted-foreground">• {t}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {diseaseResult.prevention.length > 0 && (
                  <div className="rounded-xl bg-secondary p-3">
                    <div className="text-xs font-bold mb-1.5 flex items-center gap-1.5">
                      <Leaf className="h-3.5 w-3.5 text-success" />Prevention
                    </div>
                    <ul className="space-y-1">
                      {diseaseResult.prevention.slice(0, 3).map((p, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-success shrink-0">•</span>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* ══ MODULE 1: Soil Image Analysis ══ */}
        <Card className="shadow-card">
          <CardContent className="p-5 space-y-3">
            <SectionHeader icon={FlaskConical} title="🌱 Soil Intelligence" color="text-success" />
            <input ref={soilInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleSoilFile} />
            <button
              onClick={() => soilInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-5 transition-colors hover:border-success"
            >
              {soilPreview ? (
                <div className="flex items-center gap-3">
                  <img src={soilPreview} alt="Soil" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-success">{soilFile?.name}</div>
                    <div className="text-xs text-muted-foreground">Tap to change</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FlaskConical className="h-8 w-8 text-success" />
                  <div className="text-xs font-bold">Upload soil photo</div>
                </div>
              )}
            </button>
            <Button variant="hero" className="w-full h-9 text-sm" onClick={handleSoilAnalyze} disabled={!soilFile || soilImgLoading}>
              {soilImgLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><FlaskConical className="h-4 w-4" /> Analyze Soil</>}
            </Button>

            {soilImgError && <p className="text-xs text-destructive font-semibold">{soilImgError}</p>}

            {soilImgResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="rounded-2xl bg-success/10 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-success">{soilImgResult.soil_type}</div>
                    <div className="text-xs text-muted-foreground">Detected soil type</div>
                  </div>
                  <Badge className="bg-success text-success-foreground border-0">
                    {Math.round(soilImgResult.confidence * 100)}%
                  </Badge>
                </div>
                <ConfBar value={soilImgResult.confidence} />
                <div className="space-y-1.5">
                  {[
                    ["Drainage", soilImgResult.properties.drainage],
                    ["Fertility", soilImgResult.properties.fertility],
                    ["pH Range", soilImgResult.properties.ph_range],
                    ["Texture", soilImgResult.properties.texture],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-secondary p-2.5">
                      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                      <span className="text-xs font-bold">{val}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-bold text-success uppercase tracking-wide mb-1.5">Best Crops</div>
                  <div className="flex flex-wrap gap-1.5">
                    {soilImgResult.recommendations.crops.map((c) => (
                      <Badge key={c} className="bg-success/15 text-success border-0 text-xs"><Sprout className="h-2.5 w-2.5 mr-1" />{c}</Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-accent/5 p-3">
                  <div className="text-xs font-bold mb-1">Fertilizer</div>
                  <p className="text-xs text-muted-foreground">{soilImgResult.recommendations.fertilizer}</p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
