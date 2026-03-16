import { useState, useRef } from "react";
import { ArrowLeft, Mic, MicOff, MessageCircle, Loader2, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fetchVoiceAdvice } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { label: "English", code: "en-US", tts: "en-US" },
  { label: "Tamil", code: "ta-IN", tts: "ta-IN" },
  { label: "Hindi", code: "hi-IN", tts: "hi-IN" },
];

const FAQS = [
  "Best fertilizer for rice?",
  "How to control pests in cotton?",
  "When to plant tomatoes?",
  "How to manage rice blast disease?",
  "Irrigation schedule for wheat?",
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function VoicePage() {
  const [selectedLang, setSelectedLang] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const lang = LANGUAGES[selectedLang];

  // ── TTS ───────────────────────────────────────────────────────────────────

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang.tts;
    utt.rate = 0.95;
    window.speechSynthesis.speak(utt);
  };

  // ── Fetch advice ──────────────────────────────────────────────────────────

  const askAdvice = async (question: string) => {
    setTranscript(question);
    setAnswer("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetchVoiceAdvice(question, lang.code);
      setAnswer(res.answer);
      speak(res.answer);
    } catch {
      // Should not reach here — fetchVoiceAdvice handles all errors internally
    } finally {
      setLoading(false);
    }
  };

  // ── Speech recognition ────────────────────────────────────────────────────

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }
    const recognition = new SR();
    recognition.lang = lang.code;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setIsListening(false);
      askAdvice(text);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== "aborted") {
        setError(`Microphone error: ${event.error}. Please try again.`);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
    setAnswer("");
    setError(null);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (isListening) stopListening();
    else startListening();
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Voice Advisory</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">Tap the mic and ask your farming question</p>
      </div>

      <div className="px-5 -mt-4 space-y-5 pb-8">
        {/* Language Selector */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex gap-2">
              {LANGUAGES.map((l, i) => (
                <button
                  key={l.code}
                  onClick={() => { setSelectedLang(i); setTranscript(""); setAnswer(""); setError(null); }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all min-h-[44px] ${
                    selectedLang === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {l.label}
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
                <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" style={{ animationDuration: "1.2s" }} />
                <div className="absolute inset-0 scale-125 rounded-full bg-accent/15 animate-ping" style={{ animationDuration: "1.8s" }} />
              </>
            )}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleMicClick}
              disabled={loading}
              className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-lg transition-colors disabled:opacity-60 ${
                isListening ? "bg-red-500 text-white" : "bg-primary text-primary-foreground"
              }`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
            </motion.button>
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground">
            {loading ? "Getting advice..." : isListening ? "Listening... Tap to stop" : "Tap to speak"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Transcript + Answer */}
        {transcript && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">You said</div>
                <div className="text-sm font-semibold">{transcript}</div>
              </CardContent>
            </Card>

            {answer && (
              <Card className="shadow-card border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-bold uppercase tracking-widest text-green-600">AI Response</span>
                    </div>
                    <button
                      onClick={() => speak(answer)}
                      className="rounded-lg p-1.5 hover:bg-secondary transition-colors"
                      aria-label="Read aloud"
                    >
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="text-sm leading-relaxed">{answer}</div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* FAQ Quick Questions */}
        <div>
          <h3 className="text-sm font-bold mb-3">Quick Questions</h3>
          <div className="flex flex-wrap gap-2">
            {FAQS.map((faq) => (
              <button
                key={faq}
                onClick={() => askAdvice(faq)}
                disabled={loading || isListening}
                className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground min-h-[44px] transition-colors hover:bg-secondary/80 disabled:opacity-50"
              >
                {faq}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
