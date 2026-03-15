import { ArrowLeft, CloudSun, Bug, TrendingUp, Settings, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const alerts = [
  { icon: CloudSun, title: "Heavy rain expected in 2 days", desc: "Delay pesticide spraying. Cover harvested crops.", severity: "Critical", cat: "weather", time: "2 hours ago" },
  { icon: TrendingUp, title: "Rice price up by ₹50/quintal", desc: "Current price at Coimbatore Mandi: ₹2,150.", severity: "Info", cat: "market", time: "5 hours ago" },
  { icon: Bug, title: "Early Blight detected in your area", desc: "Neighbouring farms report tomato leaf blight. Check your fields.", severity: "Warning", cat: "pest", time: "1 day ago" },
  { icon: ShieldAlert, title: "System maintenance tonight", desc: "App will be unavailable 2-4 AM for updates.", severity: "Info", cat: "system", time: "1 day ago" },
  { icon: CloudSun, title: "Frost alert for hill areas", desc: "Temperature may drop below 5°C in Nilgiris.", severity: "Warning", cat: "weather", time: "2 days ago" },
  { icon: TrendingUp, title: "Cotton prices falling", desc: "Down ₹200/quintal this week. Consider holding stock.", severity: "Warning", cat: "market", time: "3 days ago" },
];

const severityColor = {
  Critical: "bg-destructive text-destructive-foreground",
  Warning: "bg-accent text-accent-foreground",
  Info: "bg-info text-info-foreground",
};

const severityBg = {
  Critical: "bg-destructive/10",
  Warning: "bg-accent/10",
  Info: "bg-info/10",
};

const severityIcon = {
  Critical: "text-destructive",
  Warning: "text-accent",
  Info: "text-info",
};

function AlertCard({ alert, i }: { alert: typeof alerts[0]; i: number }) {
  const Icon = alert.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
      <Card className="shadow-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${severityBg[alert.severity as keyof typeof severityBg]}`}>
              <Icon className={`h-5 w-5 ${severityIcon[alert.severity as keyof typeof severityIcon]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-bold">{alert.title}</span>
                <Badge className={`shrink-0 text-[10px] border-0 ${severityColor[alert.severity as keyof typeof severityColor]}`}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{alert.desc}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">Mark as Read</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Smart Alerts</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">Emergency notifications and reminders</p>
      </div>

      <div className="px-5 -mt-4 pb-6">
        <Tabs defaultValue="all">
          <TabsList className="w-full bg-card shadow-card rounded-xl h-11 mb-4">
            <TabsTrigger value="all" className="flex-1 rounded-lg text-xs font-semibold">All</TabsTrigger>
            <TabsTrigger value="weather" className="flex-1 rounded-lg text-xs font-semibold">Weather</TabsTrigger>
            <TabsTrigger value="pest" className="flex-1 rounded-lg text-xs font-semibold">Pest</TabsTrigger>
            <TabsTrigger value="market" className="flex-1 rounded-lg text-xs font-semibold">Market</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {alerts.map((a, i) => <AlertCard key={i} alert={a} i={i} />)}
          </TabsContent>
          <TabsContent value="weather" className="space-y-3">
            {alerts.filter(a => a.cat === "weather").map((a, i) => <AlertCard key={i} alert={a} i={i} />)}
          </TabsContent>
          <TabsContent value="pest" className="space-y-3">
            {alerts.filter(a => a.cat === "pest").map((a, i) => <AlertCard key={i} alert={a} i={i} />)}
          </TabsContent>
          <TabsContent value="market" className="space-y-3">
            {alerts.filter(a => a.cat === "market").map((a, i) => <AlertCard key={i} alert={a} i={i} />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
