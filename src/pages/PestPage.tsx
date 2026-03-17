import { useState, useRef } from "react";
import { ArrowLeft, Camera, Upload, Bug, Loader2, AlertTriangle, CheckCircle, Shield, Leaf, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { predictCropDisease, type DiseaseResult } from "@/lib/api";
import { compressImage } from "@/lib/imageUtils";
import { downloadDiseaseReport } from "@/lib/reportGenerator";

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-success" : pct >= 60 ? "bg-accent" : "bg-destructive";
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-semibold">Confidence</span>
        <span className="font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function PestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(selected));
  };

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const compressed = await compressImage(file);
      const data = await predictCropDisease(compressed);
      setResult(data);
      localStorage.setItem("lastScan", JSON.stringify({
        health: data.disease,
        confidence: Math.round(data.confidence * 100),
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Detection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      await downloadDiseaseReport(result, preview ?? undefined);
    } finally {
      setDownloading(false);
    }
  };

  const isHealthy = result?.disease.toLowerCase().includes("healthy");

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Pest & Disease Detection</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">Upload crop photo for AI diagnosis</p>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-6">
        {/* Upload */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-8 min-h-[200px] transition-colors hover:border-accent"
              aria-label="Upload crop photo"
            >
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={preview} alt="Uploaded crop" className="h-32 w-32 rounded-2xl object-cover" />
                  <span className="text-sm font-semibold text-success">{file?.name}</span>
                  <span className="text-xs text-muted-foreground">Tap to change</span>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-accent" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold">Tap to upload a crop photo</div>
                    <div className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</div>
                  </div>
                </>
              )}
            </button>
            <Button variant="hero" onClick={handleDetect} className="w-full mt-4" disabled={!file || loading}>
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : <><Camera className="h-5 w-5" /> Detect Now</>}
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Detection result */}
            <Card className={`shadow-card ${isHealthy ? "border-success/30" : "border-accent/30"}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isHealthy ? <CheckCircle className="h-5 w-5 text-success" /> : <Bug className="h-5 w-5 text-accent" />}
                    <h3 className="text-lg font-bold">Detection Result</h3>
                  </div>
                  <Badge className={`border-0 ${isHealthy ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"}`}>
                    {Math.round(result.confidence * 100)}% Confident
                  </Badge>
                </div>

                <div className={`rounded-2xl p-4 ${isHealthy ? "bg-success/10" : "bg-accent/10"}`}>
                  <div className={`text-xl font-bold ${isHealthy ? "text-success" : "text-accent"}`}>{result.disease}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.description}</div>
                </div>

                <ConfidenceBar value={result.confidence} />
                <div className="flex justify-end">
                  <Badge
                    className={`border-0 text-xs ${
                      result.certainty === "High Confidence"
                        ? "bg-success/20 text-success"
                        : result.certainty === "Moderate Confidence"
                        ? "bg-accent/20 text-accent"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {result.certainty}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Symptoms */}
            {result.symptoms.length > 0 && !isHealthy && (
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    <h3 className="text-sm font-bold">Symptoms</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.symptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-accent mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Treatment */}
            {!isHealthy && (
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <h3 className="text-sm font-bold">Treatment</h3>
                  </div>
                  {result.treatment.organic.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-bold text-success mb-2 uppercase tracking-wide">Organic</div>
                      <div className="space-y-2">
                        {result.treatment.organic.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-xl bg-success/5 p-3">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">{i + 1}</div>
                            <span className="text-sm">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.treatment.chemical.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-accent mb-2 uppercase tracking-wide">Chemical</div>
                      <div className="space-y-2">
                        {result.treatment.chemical.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl bg-secondary p-3">
                            <Shield className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm font-semibold">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Prevention */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="h-5 w-5 text-success" />
                  <h3 className="text-sm font-bold">Prevention Tips</h3>
                </div>
                <ul className="space-y-2">
                  {result.prevention.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-success mt-0.5">•</span> {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Download Report */}
            <Button
              variant="hero"
              onClick={handleDownloadReport}
              disabled={downloading}
              className="w-full"
            >
              {downloading
                ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating PDF...</>
                : <><Download className="h-5 w-5" /> Download Report</>}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
