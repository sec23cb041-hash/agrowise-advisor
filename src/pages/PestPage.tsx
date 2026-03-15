import { useState } from "react";
import { ArrowLeft, Camera, Upload, AlertTriangle, CheckCircle, Shield, Bug } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function PestPage() {
  const [uploaded, setUploaded] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleDetect = () => {
    setShowResults(true);
  };

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
        {/* Upload Area */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <button
              onClick={() => setUploaded(true)}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-8 min-h-[200px] transition-colors hover:border-accent"
              aria-label="Upload crop photo"
            >
              {uploaded ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-32 w-32 rounded-2xl bg-success/10 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-success" />
                  </div>
                  <span className="text-sm font-semibold text-success">Photo uploaded!</span>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-accent" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold">Tap to upload or take a crop photo</div>
                    <div className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</div>
                  </div>
                </>
              )}
            </button>

            <Button
              variant="hero"
              onClick={handleDetect}
              className="w-full mt-4"
              disabled={!uploaded}
            >
              <Camera className="h-5 w-5" />
              Detect Now
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Detection Result */}
            <Card className="shadow-card border-accent/30">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-bold">Detection Result</h3>
                  </div>
                  <Badge className="bg-accent text-accent-foreground border-0">85% Confident</Badge>
                </div>

                <div className="rounded-2xl bg-accent/10 p-4 mb-4">
                  <div className="text-xl font-bold text-accent">Early Blight Detected</div>
                  <div className="text-sm text-muted-foreground mt-1">on Tomato Leaves</div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  Early blight is caused by the fungus <strong>Alternaria solani</strong>. It appears as dark, concentric rings on lower leaves and can spread rapidly in warm, humid conditions.
                </p>
              </CardContent>
            </Card>

            {/* Treatment */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <h3 className="text-lg font-bold">Treatment Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {[
                    "Remove and destroy infected leaves immediately",
                    "Apply Mancozeb 75% WP (2g/litre) as foliar spray",
                    "Improve air circulation between plants by pruning",
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-success/5 p-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm leading-relaxed">{t}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pesticides */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold mb-3">Recommended Pesticides</h3>
                <div className="space-y-2">
                  {["Mancozeb 75% WP", "Chlorothalonil", "Copper Oxychloride"].map((p) => (
                    <div key={p} className="flex items-center gap-2 rounded-xl bg-secondary p-3">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{p}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prevention */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold">Preventive Measures</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-accent">•</span> Practice crop rotation every season</li>
                  <li className="flex items-start gap-2"><span className="text-accent">•</span> Use disease-resistant tomato varieties</li>
                  <li className="flex items-start gap-2"><span className="text-accent">•</span> Avoid overhead watering — use drip irrigation</li>
                  <li className="flex items-start gap-2"><span className="text-accent">•</span> Maintain proper spacing between plants</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
