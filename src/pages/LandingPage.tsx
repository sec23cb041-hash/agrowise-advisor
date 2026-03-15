import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, LogIn, UserPlus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const languages = ["EN", "தமிழ்", "हिंदी"];

export default function LandingPage() {
  const [lang, setLang] = useState(0);

  return (
    <div className="relative min-h-screen flex flex-col bg-primary overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leaves" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 10 Q50 30 40 50 Q30 30 40 10Z" fill="currentColor" className="text-primary-foreground" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leaves)" />
        </svg>
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-end p-5">
        <button
          onClick={() => setLang((l) => (l + 1) % languages.length)}
          className="flex items-center gap-2 rounded-xl bg-primary-foreground/10 px-4 py-2 text-sm font-semibold text-primary-foreground backdrop-blur-sm"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          {languages[lang]}
        </button>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="mb-8"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-accent shadow-lg">
            <Leaf className="h-12 w-12 text-accent-foreground" />
          </div>
          <h1 className="mb-3 text-4xl font-bold text-primary-foreground">
            TechTrack
          </h1>
          <p className="text-xl font-medium text-primary-foreground/80">
            Smart Farming. Better Harvest.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex w-full max-w-xs flex-col gap-4"
        >
          <Button variant="accent" size="lg" asChild className="w-full">
            <Link to="/dashboard">
              <LogIn className="h-5 w-5" />
              Login
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/dashboard">
              <UserPlus className="h-5 w-5" />
              Register as Farmer
            </Link>
          </Button>
        </motion.div>
      </div>

      <div className="relative z-10 p-5 text-center text-sm text-primary-foreground/50">
        © 2026 TechTrack — Precision Farming Advisory
      </div>
    </div>
  );
}
