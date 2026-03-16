import { useEffect, useState } from "react";
import { ArrowLeft, Database, Sprout, FlaskConical, Loader2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { fetchDatasetStats, type DatasetStats } from "@/lib/api";

const COLORS = ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#84cc16","#ec4899","#14b8a6"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-secondary p-4">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs font-semibold text-muted-foreground mt-1 text-center">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function DatasetInsightsPage() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasetStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const npkData = stats ? [
    { name: "Nitrogen", value: stats.avg_nitrogen, fill: "#22c55e" },
    { name: "Phosphorus", value: stats.avg_phosphorus, fill: "#f59e0b" },
    { name: "Potassium", value: stats.avg_potassium, fill: "#3b82f6" },
  ] : [];

  const cropPieData = stats?.top_crops.map((c, i) => ({
    name: c.crop, value: c.count, fill: COLORS[i % COLORS.length],
  })) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">Dataset Insights</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">Statistics from the crop recommendation training dataset</p>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-8">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading dataset statistics…</span>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-destructive/10 p-4 flex items-start gap-3 mt-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <span className="text-sm text-destructive font-semibold">{error}</span>
          </div>
        )}

        {stats && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Summary stats */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold">Dataset Overview</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Total Samples" value={stats.total_samples.toLocaleString()} />
                  <StatCard label="Unique Crops" value={stats.unique_crops} />
                  <StatCard label="Soil Types" value={stats.unique_soil_types} />
                  <StatCard label="Avg Temperature" value={`${stats.avg_temperature}°C`} />
                </div>
              </CardContent>
            </Card>

            {/* Average NPK */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold">Average Soil Nutrients (kg/ha)</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <StatCard label="Avg N" value={stats.avg_nitrogen} sub="Nitrogen" />
                  <StatCard label="Avg P" value={stats.avg_phosphorus} sub="Phosphorus" />
                  <StatCard label="Avg K" value={stats.avg_potassium} sub="Potassium" />
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={npkData} barSize={44}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [`${v} kg/ha`]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {npkData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top crops bar chart */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sprout className="h-5 w-5 text-success" />
                  <h3 className="text-sm font-bold">Top Crops in Dataset</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.top_crops} layout="vertical" barSize={18}>
                    <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="crop" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip formatter={(v: number) => [`${v} samples`]} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {stats.top_crops.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie chart */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sprout className="h-5 w-5 text-success" />
                  <h3 className="text-sm font-bold">Crop Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={cropPieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {cropPieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v: number) => [`${v} samples`]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Env averages */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-5 w-5 text-info" />
                  <h3 className="text-sm font-bold">Average Environmental Values</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Humidity" value={`${stats.avg_humidity}%`} />
                  <StatCard label="Moisture" value={`${stats.avg_moisture}%`} />
                  <StatCard label="Temperature" value={`${stats.avg_temperature}°C`} />
                </div>
              </CardContent>
            </Card>

          </motion.div>
        )}
      </div>
    </div>
  );
}
