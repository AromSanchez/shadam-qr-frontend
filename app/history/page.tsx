"use client";

import { useState } from "react";
import { ArrowLeft, Coffee, Utensils, Calendar, Filter, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/ui/bottom-nav";
import { motion } from "framer-motion";

const HISTORY_DATA = [
  {
    date: "Hoy",
    items: [
      { id: 1, name: "Café Americano", type: "drinks", time: "08:30 AM", price: 5.00, method: "saldo" },
      { id: 2, name: "Menú Ejecutivo", type: "food", time: "01:15 PM", price: 18.00, method: "plan" },
    ],
  },
  {
    date: "Ayer",
    items: [
      { id: 3, name: "Lomo Saltado", type: "food", time: "12:45 PM", price: 45.00, method: "plan" },
      { id: 4, name: "Pisco Sour", type: "drinks", time: "02:00 PM", price: 28.00, method: "saldo" },
      { id: 5, name: "Tequeños", type: "food", time: "06:30 PM", price: 18.00, method: "saldo" },
    ],
  },
  {
    date: "25 Mar 2026",
    items: [
      { id: 6, name: "Ceviche de la Casa", type: "food", time: "01:00 PM", price: 38.00, method: "plan" },
      { id: 7, name: "Limonada Frozen", type: "drinks", time: "01:30 PM", price: 12.00, method: "saldo" },
    ],
  },
];

type FilterType = "all" | "food" | "drinks";

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilter, setShowFilter] = useState(false);

  const totalSpent = HISTORY_DATA.flatMap(d => d.items).reduce((a, b) => a + b.price, 0);
  const totalPlan = HISTORY_DATA.flatMap(d => d.items).filter(i => i.method === "plan").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
          </Link>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">Historial</h1>
          <button
            title="Filtrar historial"
            onClick={() => setShowFilter(!showFilter)}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Gasto total</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">S/ {totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30">
            <p className="text-xs font-semibold text-primary uppercase mb-1">Con plan</p>
            <p className="text-2xl font-bold text-primary">{totalPlan} comidas</p>
          </div>
        </div>

        {/* Filter Pills */}
        {showFilter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="flex gap-2 mt-4 overflow-hidden"
          >
            {(["all", "food", "drinks"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === f
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {f === "all" ? "Todo" : f === "food" ? "Comidas" : "Bebidas"}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* History List */}
      <main className="px-6 py-6 space-y-6">
        {HISTORY_DATA.map((group, gi) => {
          const filteredItems = filter === "all" ? group.items : group.items.filter(i => i.type === filter);
          if (filteredItems.length === 0) return null;

          return (
            <div key={gi}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {group.date}
                </h3>
              </div>
              <div className="space-y-3">
                {filteredItems.map((item, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-primary">
                        {item.type === "drinks" ? <Coffee className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{item.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.method === "plan" ? (
                        <Badge variant="success" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 pointer-events-none">
                          Plan
                        </Badge>
                      ) : (
                        <span className="font-bold text-slate-800 dark:text-white font-mono">
                          S/ {item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
