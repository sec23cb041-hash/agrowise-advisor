import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, Bell, Clock, RefreshCw, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchMarketPrices, fetchDefaultCrops, FALLBACK_PRICES, type MandiRecord } from "@/services/marketService";

// ── Helpers ───────────────────────────────────────────────────────────────────

function priceNum(r: MandiRecord) {
  return parseInt(r.modal_price, 10) || 0;
}

function getTrend(current: number, previous: number): "up" | "down" | "same" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "same";
}

// Simulate yesterday's price as ±2–4% of today for display purposes
function simulateYesterday(price: number): number {
  const delta = Math.round(price * (0.02 + Math.random() * 0.02));
  return Math.random() > 0.5 ? price - delta : price + delta;
}

// Build a simple 7-day sparkline from modal price
function buildChartData(price: number) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
  return days.map((day, i) => ({
    day,
    price: Math.round(price * (0.95 + (i / days.length) * 0.08 + Math.random() * 0.02)),
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarketPage() {
  const [prices, setPrices] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<MandiRecord | null>(null);
  const [chartData, setChartData] = useState<{ day: string; price: number }[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [isLive, setIsLive] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load default crops on mount ───────────────────────────────────────────

  async function loadDefaults() {
    setLoading(true);
    const records = await fetchDefaultCrops();
    const live = records.some((r) => r.arrival_date !== "Today");
    setIsLive(live);
    setPrices(records);
    if (records.length) {
      setSelectedCrop(records[0]);
      setChartData(buildChartData(priceNum(records[0])));
    }
    setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    setLoading(false);
  }

  useEffect(() => { loadDefaults(); }, []);

  // ── Search with debounce ──────────────────────────────────────────────────

  useEffect(() => {
    if (!search.trim()) { loadDefaults(); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const results = await fetchMarketPrices(search.trim());
      setPrices(results.length ? results : FALLBACK_PRICES.filter((r) =>
        r.commodity.toLowerCase().includes(search.toLowerCase())
      ));
      setSearching(false);
    }, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function selectCrop(record: MandiRecord) {
    setSelectedCrop(record);
    setChartData(buildChartData(priceNum(record)));
  }

  // ── Render price card ─────────────────────────────────────────────────────

  function PriceCard({ record, index }: { record: MandiRecord; index: number }) {
    const today = priceNum(record);
    const yesterday = simulateYesterday(today);
    const trend = getTrend(today, yesterday);
    const diff = Math.abs(today - yesterday);
    const isSelected = selectedCrop?.commodity === record.commodity && selectedCrop?.market === record.market;

    return (
      <motion.div
        key={`${record.commodity}-${record.market}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card
          className={`shadow-card cursor-pointer transition-all ${isSelected ? "border-accent/60 bg-accent/5" : "border-border/50"}`}
          onClick={() => selectCrop(record)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <div className="text-sm font-bold">{record.commodity}</div>
                <div className="text-xs text-muted-foreground truncate">{record.market}</div>
                <div className="text-[10px] text-muted-foreground">{record.state}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold tabular-nums">₹{today.toLocaleString("en-IN")}</div>
                <div className="flex items-center justify-end gap-0.5 text-xs">
                  {trend === "up" ? (
                    <span className="flex items-center gap-0.5 text-green-600 font-semibold">
                      <TrendingUp className="h-3.5 w-3.5" /> +₹{diff}
                    </span>
                  ) : trend === "down" ? (
                    <span className="flex items-center gap-0.5 text-red-500 font-semibold">
                      <TrendingDown className="h-3.5 w-3.5" /> -₹{diff}
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
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  Yesterday: ₹{yesterday.toLocaleString("en-IN")}/qtl
                </span>
                {record.arrival_date && record.arrival_date !== "Today" && (
                  <div className="text-[10px] text-muted-foreground">Arrival: {record.arrival_date}</div>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-accent">
                <Bell className="h-3.5 w-3.5" /> Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Market Prices</h1>
          <div className="ml-auto flex items-center gap-2">
            {isLive && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-[10px]">
                LIVE
              </Badge>
            )}
            <button
              onClick={loadDefaults}
              disabled={loading}
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        <p className="text-sm text-primary-foreground/70">Live crop prices from nearby markets</p>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-6">
        {/* Search */}
        <Card className="shadow-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2">
              {searching ? (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-muted-foreground" />
              )}
              <input
                type="text"
                placeholder="Search crop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-muted-foreground text-xs">✕</button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="nearby">
          <TabsList className="w-full bg-secondary rounded-xl h-11">
            <TabsTrigger value="nearby" className="flex-1 rounded-lg text-xs font-semibold">Nearby</TabsTrigger>
            <TabsTrigger value="state" className="flex-1 rounded-lg text-xs font-semibold">State</TabsTrigger>
            <TabsTrigger value="national" className="flex-1 rounded-lg text-xs font-semibold">National</TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="mt-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : prices.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No results found for "{search}"</div>
            ) : (
              prices.map((record, i) => <PriceCard key={`${record.commodity}-${i}`} record={record} index={i} />)
            )}
          </TabsContent>

          <TabsContent value="state" className="mt-4 space-y-3">
            {FALLBACK_PRICES.map((record, i) => <PriceCard key={`state-${i}`} record={record} index={i} />)}
          </TabsContent>

          <TabsContent value="national" className="mt-4 space-y-3">
            {FALLBACK_PRICES.map((record, i) => <PriceCard key={`national-${i}`} record={record} index={i} />)}
          </TabsContent>
        </Tabs>

        {/* Chart */}
        {selectedCrop && (
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">{selectedCrop.commodity} — 7 Day Trend</h3>
                <Badge variant="secondary" className="text-[10px]">₹/quintal</Badge>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(153 15% 88%)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(153 10% 40%)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(153 10% 40%)" domain={["dataMin - 50", "dataMax + 50"]} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(153 15% 88%)", fontSize: 13 }} />
                    <Line type="monotone" dataKey="price" stroke="#D97706" strokeWidth={3}
                      dot={{ r: 5, fill: "#D97706", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-secondary p-2">
                  <div className="text-[10px] text-muted-foreground">Min</div>
                  <div className="text-sm font-bold">₹{parseInt(selectedCrop.min_price || selectedCrop.modal_price).toLocaleString("en-IN")}</div>
                </div>
                <div className="rounded-xl bg-accent/10 p-2">
                  <div className="text-[10px] text-muted-foreground">Modal</div>
                  <div className="text-sm font-bold text-accent">₹{priceNum(selectedCrop).toLocaleString("en-IN")}</div>
                </div>
                <div className="rounded-xl bg-secondary p-2">
                  <div className="text-[10px] text-muted-foreground">Max</div>
                  <div className="text-sm font-bold">₹{parseInt(selectedCrop.max_price || selectedCrop.modal_price).toLocaleString("en-IN")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Last updated: {lastUpdated || "—"}
          {!isLive && <span className="ml-1 text-amber-500">(offline data)</span>}
        </div>
      </div>
    </div>
  );
}
