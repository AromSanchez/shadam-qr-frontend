"use client";

import {
  DollarSign,
  ClipboardList,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import { StatCard } from "./components/StatCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// 📊 DATA

const salesData = [
  { day: "Lun", ventas: 1200 },
  { day: "Mar", ventas: 980 },
  { day: "Mié", ventas: 1450 },
  { day: "Jue", ventas: 1100 },
  { day: "Vie", ventas: 1680 },
  { day: "Sáb", ventas: 2100 },
  { day: "Dom", ventas: 1900 },
];

const topDishes = [
  { name: "Lomo Saltado", count: 45, pct: 100 },
  { name: "Ceviche Mixto", count: 38, pct: 84 },
  { name: "Ají de Gallina", count: 32, pct: 71 },
  { name: "Arroz con Pollo", count: 28, pct: 62 },
  { name: "Seco de Res", count: 22, pct: 49 },
];

const paymentData = [
  { name: "Efectivo", value: 40, color: "#B7410E" },
  { name: "Yape", value: 30, color: "#7c3aed" },
  { name: "Plin", value: 20, color: "#22c55e" },
  { name: "Saldo", value: 10, color: "#facc15" },
];

// 🚀 COMPONENTE

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de operaciones del día
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventas de Hoy"
          value="S/ 2,450"
          icon={DollarSign}
          trend={{ value: "12% vs ayer", positive: true }}
        />
        <StatCard
          title="Consumos"
          value="86"
          icon={ClipboardList}
          trend={{ value: "8% vs ayer", positive: true }}
        />
        <StatCard
          title="Pensionistas"
          value="24"
          subtitle="de 32 registrados"
          icon={Users}
        />
        <StatCard
          title="Con Deuda"
          value="5"
          subtitle="S/ -340 total"
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* BAR CHART */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Ventas de la Semana
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [`S/ ${value}`, "Ventas"]}
                />                <Bar
                  dataKey="ventas"
                  fill="#aa4918"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PIE CHART */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Método de Pago
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {paymentData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} />

              </PieChart>
            </ResponsiveContainer>

            {/* LEGEND */}
            <div className="space-y-2 mt-3">
              {paymentData.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                  </div>
                  <span className="font-medium">{p.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TOP DISHES */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Platos Más Vendidos
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {topDishes.map((dish, i) => (
              <div key={dish.name} className="flex items-center gap-3">
                <span className="text-sm w-5 text-muted-foreground">
                  {i + 1}
                </span>

                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">
                      {dish.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {dish.count} ventas
                    </span>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#aa4918] rounded-full"
                      style={{ width: `${dish.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}