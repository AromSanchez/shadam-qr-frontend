"use client";

import { useState, useEffect } from "react";
import { usePensioner } from "../context";
import { motion } from "framer-motion";
import { Coffee, Utensils, MoonStar, TrendingUp, Calendar, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ConsumptionRecord {
  id: string;
  userId: string;
  mealType: string;
  amount: number;
  date: string;
}

interface DayHistory {
  meals: string[];
  totalCharged: number;
}

interface StatsData {
  totalConsumed: number;
  totalCharged: number;
  history: Record<string, DayHistory>;
}

export default function ConsumoPage() {
  const { user, loading } = usePensioner();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/proxy?path=/consumptions/me/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        toast.error("Error al cargar estadisticas");
      } finally {
        setFetching(false);
      }
    }
    if (user) fetchStats();
  }, [user]);

  if (loading || !user || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const todayData = stats?.history?.[todayStr];
  const todayMeals = todayData?.meals || [];

  const mealIcons = [
    { type: "DESAYUNO", label: "Desayuno", icon: Coffee, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { type: "ALMUERZO", label: "Almuerzo", icon: Utensils, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    { type: "CENA", label: "Cena", icon: MoonStar, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
  ];

  // Sort history by date descending
  const historyEntries = stats?.history
    ? Object.entries(stats.history).sort(([a], [b]) => b.localeCompare(a))
    : [];

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Historial de Consumos
        </h1>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span className="text-xs text-slate-400 font-medium">Total consumos</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalConsumed ?? 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-400 font-medium">Total cobrado</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              S/ {Number(stats?.totalCharged || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Today's Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Hoy
        </h2>

        <div className="space-y-2">
          {mealIcons.map((meal) => {
            const consumed = todayMeals.includes(meal.type);
            const Icon = meal.icon;
            return (
              <div
                key={meal.type}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  consumed
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30"
                    : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${consumed ? "bg-emerald-500 text-white" : meal.bg + " " + meal.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{meal.label}</p>
                </div>
                {consumed ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-500">Consumido</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Pendiente</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Historial por dia
        </h2>

        {historyEntries.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No hay consumos registrados
          </div>
        ) : (
          <div className="space-y-2">
            {historyEntries.map(([date, data]) => (
              <div
                key={date}
                className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">
                    {new Date(date + "T12:00:00").toLocaleDateString("es-PE", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <span className="text-xs font-medium text-slate-400">
                    S/ {Number(data.totalCharged || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {data.meals.map((meal, idx) => {
                    const mealName = meal === "DESAYUNO" ? "Des" : meal === "ALMUERZO" ? "Alm" : "Cen";
                    const mealColor = meal === "DESAYUNO" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : meal === "ALMUERZO" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
                    return (
                      <span
                        key={idx}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${mealColor}`}
                      >
                        {mealName}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
