"use client";

import { usePensioner } from "./context";
import Link from "next/link";
import { motion } from "framer-motion";
import { QrCode, Wallet, Coffee, Utensils, MoonStar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PensionistaDashboard() {
  const { user, loading } = usePensioner();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const meals = [
    { type: "DESAYUNO", label: "Desayuno", icon: Coffee, color: "bg-amber-500" },
    { type: "ALMUERZO", label: "Almuerzo", icon: Utensils, color: "bg-emerald-500" },
    { type: "CENA", label: "Cena", icon: MoonStar, color: "bg-indigo-500" },
  ];

  const consumedMeals = user.todayConsumptions?.map((c) => c.mealType.toUpperCase()) || [];
  const totalToday = user.todayConsumptions?.length || 0;

  // Pensioner type display
  const typeLabel = user.pensioner_type === "fixed" ? "Fijo" : user.pensioner_type === "variable" ? "Variable" : user.pensioner_type;

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      {/* Header greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">Hola,</p>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
          {user.name}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {typeLabel}
          </Badge>
          {user.is_active && (
            <Badge variant="success" className="text-xs">
              Activo
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-5 text-white mb-6 shadow-lg shadow-cyan-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cyan-100 text-xs font-medium">Saldo disponible</p>
            <p className="text-3xl font-bold mt-1">
              S/ {Number(user.balance || 0).toFixed(2)}
            </p>
          </div>
          <Wallet className="w-10 h-10 text-cyan-200/60" />
        </div>
      </motion.div>

      {/* Today's Meals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Comidas de hoy
          </h2>
          <span className="text-xs text-slate-400">{totalToday}/3 consumidas</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {meals.map((meal) => {
            const consumed = consumedMeals.includes(meal.type);
            const Icon = meal.icon;
            return (
              <div
                key={meal.type}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                  consumed
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30"
                    : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    consumed
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {meal.label}
                </span>
                <span className={`text-[10px] mt-0.5 font-medium ${consumed ? "text-emerald-500" : "text-slate-400"}`}>
                  {consumed ? "Consumido" : "Pendiente"}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {/* QR Link */}
        <Link href="/pensionista/qr">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-800 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">Mi Codigo QR</p>
                <p className="text-xs text-slate-400">Presentar en recepcion</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
          </div>
        </Link>

        {/* History Link */}
        <Link href="/pensionista/consumo">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-800 transition-colors group mt-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-slate-500 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">Historial de consumos</p>
                <p className="text-xs text-slate-400">Ver estadisticas y detalles</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
