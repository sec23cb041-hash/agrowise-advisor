import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Leaf, Camera, CloudSun, TrendingUp, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/soil", icon: Leaf, label: "Soil" },
  { path: "/pest", icon: Camera, label: "Scan" },
  { path: "/weather", icon: CloudSun, label: "Weather" },
  { path: "/market", icon: TrendingUp, label: "Market" },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Floating Voice Help Button */}
      <Link
        to="/voice"
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg active:scale-95 transition-transform"
        aria-label="Voice Help"
      >
        <Mic className="h-6 w-6" />
      </Link>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-20 border-t border-border backdrop-blur-md bg-card/80" aria-label="Main navigation">
        <div className="mx-auto flex h-full max-w-lg items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[56px] min-h-[44px] transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-2 right-2 h-1 rounded-b-full bg-primary"
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  />
                )}
                <Icon className="h-6 w-6" />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
