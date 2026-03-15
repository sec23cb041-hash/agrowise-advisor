import { useState } from "react";
import { ArrowLeft, FlaskConical, MapPin, Leaf, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const soilTypes = ["Red Soil", "Black Soil", "Loamy", "Sandy", "Clay"];
const cropTypes = ["Rice", "Wheat", "Cotton", "Tomato", "Onion", "Sugarcane"];

export default function SoilPage() {
  const [soilType, setSoilType] = useState("");
  const [cropType, setCropType] = useState("");
  const [ph, setPh] = useState([6.8]);
  const [moisture, setMoisture] = useState([62]);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    if (soilType && cropType) setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Soil Health & Fertilizer</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">Check soil status and get fertilizer advice</p>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-6">
        <Card className="shadow-card">
          <CardContent className="p-5 space-y-5">
            {/* Soil Type */}
            <div>
              <label className="text-sm font-bold mb-2 block">Soil Type</label>
              <div className="flex flex-wrap gap-2">
                {soilTypes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSoilType(s)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all min-h-[44px] ${
                      soilType === s ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Crop Type */}
            <div>
              <label className="text-sm font-bold mb-2 block">Crop Type</label>
              <div className="flex flex-wrap gap-2">
                {cropTypes.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCropType(c)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all min-h-[44px] ${
                      cropType === c ? "bg-accent text-accent-foreground shadow-card" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-bold mb-2 block">Field Location</label>
              <button className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground min-h-[44px]">
                <MapPin className="h-5 w-5 text-accent" />
                Coimbatore, Tamil Nadu (GPS)
              </button>
            </div>

            {/* pH Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold">Soil pH</label>
                <span className="text-lg font-bold tabular-nums text-accent">{ph[0]}</span>
              </div>
              <Slider value={ph} onValueChange={setPh} min={0} max={14} step={0.1} className="py-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Acidic (0)</span><span>Neutral (7)</span><span>Alkaline (14)</span>
              </div>
            </div>

            {/* Moisture Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold">Moisture Level</label>
                <span className="text-lg font-bold tabular-nums text-info">{moisture[0]}%</span>
              </div>
              <Slider value={moisture} onValueChange={setMoisture} min={0} max={100} step={1} className="py-2" />
            </div>

            <Button variant="hero" onClick={handleAnalyze} className="w-full">
              <FlaskConical className="h-5 w-5" />
              Analyze Soil
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
            <Card className="shadow-card border-success/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <h3 className="text-lg font-bold">Soil Analysis Results</h3>
                </div>

                {/* Health Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold">Health Score</span>
                    <span className="font-bold text-success">78/100</span>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-success" style={{ width: "78%" }} />
                  </div>
                </div>

                {/* Fertilizers */}
                <div className="mb-4">
                  <h4 className="text-sm font-bold mb-2">Recommended Fertilizers</h4>
                  <div className="space-y-2">
                    {[
                      { name: "Urea (N)", qty: "120 kg/hectare" },
                      { name: "DAP (P)", qty: "60 kg/hectare" },
                      { name: "Potash (K)", qty: "40 kg/hectare" },
                    ].map((f) => (
                      <div key={f.name} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                        <span className="text-sm font-semibold">{f.name}</span>
                        <Badge variant="secondary" className="tabular-nums">{f.qty}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suitable Crops */}
                <div className="mb-4">
                  <h4 className="text-sm font-bold mb-2">Suitable Crops</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Rice", "Tomato", "Groundnut", "Maize"].map((c) => (
                      <Badge key={c} className="bg-success/10 text-success border-0 px-3 py-1">
                        <Leaf className="h-3 w-3 mr-1" /> {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 rounded-xl bg-accent/10 p-3">
                  <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-bold">Caution:</span> Nitrogen levels slightly high. Reduce Urea by 10% to avoid over-fertilization.
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
