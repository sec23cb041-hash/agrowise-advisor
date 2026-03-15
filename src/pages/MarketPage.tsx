import { useState } from "react";
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, Bell, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const cropPrices = [
  { name: "Rice", today: 2150, yesterday: 2100, trend: "up", best: "Coimbatore Mandi" },
  { name: "Wheat", today: 2350, yesterday: 2380, trend: "down", best: "Chennai Market" },
  { name: "Cotton", today: 6200, yesterday: 6200, trend: "same", best: "Erode Mandi" },
  { name: "Tomato", today: 980, yesterday: 1050, trend: "down", best: "Mettupalayam" },
  { name: "Onion", today: 1800, yesterday: 1750, trend: "up", best: "Oddanchatram" },
  { name: "Sugarcane", today: 3100, yesterday: 3050, trend: "up", best: "Coimbatore" },
];

const chartData = [
  { day: "Mon", price: 2050 },
  { day: "Tue", price: 2080 },
  { day: "Wed", price: 2120 },
  { day: "Thu", price: 2090 },
  { day: "Fri", price: 2100 },
  { day: "Sat", price: 2130 },
  { day: "Sun", price: 2150 },
];

export default function MarketPage() {
  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Rice");

  const filtered = cropPrices.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Market Prices</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">Live crop prices from nearby markets</p>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-6">
        {/* Search */}
        <Card className="shadow-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search crop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <Tabs defaultValue="nearby">
          <TabsList className="w-full bg-secondary rounded-xl h-11">
            <TabsTrigger value="nearby" className="flex-1 rounded-lg text-xs font-semibold">Nearby</TabsTrigger>
            <TabsTrigger value="state" className="flex-1 rounded-lg text-xs font-semibold">State</TabsTrigger>
            <TabsTrigger value="national" className="flex-1 rounded-lg text-xs font-semibold">National</TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="mt-4 space-y-3">
            {filtered.map((crop, i) => (
              <motion.div
                key={crop.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`shadow-card cursor-pointer transition-all ${selectedCrop === crop.name ? "border-accent/50" : "border-border/50"}`}
                  onClick={() => setSelectedCrop(crop.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">{crop.name}</div>
                        <div className="text-xs text-muted-foreground">{crop.best}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold tabular-nums">₹{crop.today.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-xs">
                          {crop.trend === "up" ? (
                            <span className="flex items-center gap-0.5 text-success font-semibold">
                              <TrendingUp className="h-3.5 w-3.5" /> +₹{crop.today - crop.yesterday}
                            </span>
                          ) : crop.trend === "down" ? (
                            <span className="flex items-center gap-0.5 text-destructive font-semibold">
                              <TrendingDown className="h-3.5 w-3.5" /> -₹{crop.yesterday - crop.today}
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-muted-foreground font-semibold">
                              <Minus className="h-3.5 w-3.5" /> No change
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground tabular-nums">Yesterday: ₹{crop.yesterday.toLocaleString()}/qtl</span>
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-accent">
                        <Bell className="h-3.5 w-3.5" /> Alert
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
          <TabsContent value="state"><div className="py-8 text-center text-sm text-muted-foreground">State market data loading...</div></TabsContent>
          <TabsContent value="national"><div className="py-8 text-center text-sm text-muted-foreground">National data loading...</div></TabsContent>
        </Tabs>

        {/* Chart */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">{selectedCrop} — 7 Day Trend</h3>
              <Badge variant="secondary" className="text-[10px]">₹/quintal</Badge>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(153 15% 88%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(153 10% 40%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(153 10% 40%)" domain={["dataMin - 50", "dataMax + 50"]} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(153 15% 88%)", fontSize: 13 }} />
                  <Line type="monotone" dataKey="price" stroke="#D97706" strokeWidth={3} dot={{ r: 5, fill: "#D97706", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Last updated: Today, 9:30 AM
        </div>
      </div>
    </div>
  );
}
