import { useState } from "react";
import { ArrowLeft, Mic, Globe, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const languages = ["English", "Tamil", "Hindi"];
const faqs = [
  "Best fertilizer for rice?",
  "Rain forecast?",
  "Tomato price today?",
  "How to control pests?",
];

const pastQueries = [
  { q: "What is the best time to plant tomatoes?", a: "In Tamil Nadu, the best time is October-November for the winter crop. Prepare seedlings 3-4 weeks before transplanting.", lang: "English" },
  { q: "நெல்லுக்கு எந்த உரம் சிறந்தது?", a: "நெல் சாகுபடிக்கு DAP மற்றும் யூரியா கலவை பரிந்துரைக்கப்படுகிறது. ஹெக்டேருக்கு 120 கிலோ யூரியா.", lang: "Tamil" },
];

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      setTranscript("What is the best fertilizer for rice?");
      setResponse("For rice cultivation in your region, a combination of Urea (120 kg/ha), DAP (60 kg/ha), and Potash (40 kg/ha) is recommended. Apply Urea in 3 split doses for best results.");
    } else {
      setIsListening(true);
      setTranscript("");
      setResponse("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Voice Advisory</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">Tap to speak in your language</p>
      </div>

      <div className="px-5 -mt-4 space-y-5 pb-6">
        {/* Language Selector */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex gap-2">
              {languages.map((l, i) => (
                <button
                  key={l}
                  onClick={() => setSelectedLang(i)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all min-h-[44px] ${
                    selectedLang === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mic Button */}
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
                <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse-ring-slow" />
                <div className="absolute inset-0 rounded-full bg-accent/10 animate-pulse-ring-slower" />
              </>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleMicClick}
              className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-lg transition-colors ${
                isListening ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
              }`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <Mic className="h-10 w-10" />
            </motion.button>
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground">
            {isListening ? "Listening... Tap to stop" : "Tap to speak"}
          </p>
        </div>

        {/* Transcript & Response */}
        {transcript && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Card className="shadow-card border-border/50">
              <CardContent className="p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">You said</div>
                <div className="text-sm font-semibold">{transcript}</div>
              </CardContent>
            </Card>
            {response && (
              <Card className="shadow-card border-success/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-success" />
                    <div className="text-xs font-bold uppercase tracking-widest text-success">AI Response</div>
                  </div>
                  <div className="text-sm leading-relaxed">{response}</div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* FAQ Chips */}
        <div>
          <h3 className="text-sm font-bold mb-3">Quick Questions</h3>
          <div className="flex flex-wrap gap-2">
            {faqs.map((faq) => (
              <button
                key={faq}
                onClick={() => {
                  setTranscript(faq);
                  setResponse("Based on your location and crop profile, here is our recommendation. Please check the detailed advisory on your dashboard.");
                }}
                className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground min-h-[44px] transition-colors hover:bg-secondary/80"
              >
                {faq}
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <h3 className="text-sm font-bold mb-3">Past Queries</h3>
          <div className="space-y-3">
            {pastQueries.map((pq, i) => (
              <Card key={i} className="shadow-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-[10px]">{pq.lang}</Badge>
                  </div>
                  <div className="text-sm font-semibold mb-1">{pq.q}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{pq.a}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
