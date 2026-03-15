import { useState } from "react";
import { ArrowLeft, User, Phone, MapPin, Globe, Bell, LogOut, Plus, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const fields = [
  { name: "Main Rice Field", crop: "Rice", area: "5 acres" },
  { name: "Tomato Plot", crop: "Tomato", area: "2 acres" },
];

export default function ProfilePage() {
  const [notifications, setNotifications] = useState({
    weather: true,
    pest: true,
    market: true,
    system: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Profile & Settings</h1>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-6">
        {/* Avatar & Name */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="text-lg font-bold">Ravi Kumar</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> Coimbatore, Tamil Nadu
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Profile */}
        <Card className="shadow-card">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold">Edit Profile</h3>
            {[
              { icon: User, label: "Name", value: "Ravi Kumar" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210" },
              { icon: MapPin, label: "Village", value: "Sulur" },
              { icon: MapPin, label: "District", value: "Coimbatore" },
              { icon: Globe, label: "Language", value: "English" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                <f.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{f.label}</div>
                  <div className="text-sm font-semibold">{f.value}</div>
                </div>
              </div>
            ))}
            <Button variant="accent" className="w-full">Save Changes</Button>
          </CardContent>
        </Card>

        {/* My Fields */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">My Fields</h3>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-accent">
                <Plus className="h-3.5 w-3.5" /> Add Field
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((f) => (
                <div key={f.name} className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
                    <Leaf className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.crop} • {f.area}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-bold">Notification Preferences</h3>
            </div>
            <div className="space-y-3">
              {(Object.keys(notifications) as Array<keyof typeof notifications>).map((key) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                  <span className="text-sm font-semibold capitalize">{key} Alerts</span>
                  <button
                    onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                    className={`h-7 w-12 rounded-full transition-colors ${notifications[key] ? "bg-success" : "bg-muted-foreground/30"}`}
                    aria-label={`Toggle ${key} notifications`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${notifications[key] ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="outline" className="w-full border-destructive/30 text-destructive" asChild>
          <Link to="/">
            <LogOut className="h-5 w-5" />
            Logout
          </Link>
        </Button>
      </div>
    </div>
  );
}
