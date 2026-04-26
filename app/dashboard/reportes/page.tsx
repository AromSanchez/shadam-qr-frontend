"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
} from "lucide-react";

// 📊 Data
const salesReport = [
  { fecha: "2026-04-02", ventas: 2450, consumos: 86, pensionistas: 34, externos: 52 },
  { fecha: "2026-04-01", ventas: 2180, consumos: 72, pensionistas: 28, externos: 44 },
  { fecha: "2026-03-31", ventas: 1950, consumos: 65, pensionistas: 25, externos: 40 },
  { fecha: "2026-03-30", ventas: 2300, consumos: 78, pensionistas: 31, externos: 47 },
  { fecha: "2026-03-29", ventas: 2100, consumos: 70, pensionistas: 27, externos: 43 },
  { fecha: "2026-03-28", ventas: 1850, consumos: 61, pensionistas: 23, externos: 38 },
];

const userConsumptions = [
  {
    id: 1,
    name: "Carlos Méndez",
    desayuno: 22,
    almuerzo: 28,
    cena: 15,
    total: 65,
    monto: 520,
  },
  {
    id: 2,
    name: "María López",
    desayuno: 18,
    almuerzo: 25,
    cena: 10,
    total: 53,
    monto: 424,
  },
  {
    id: 3,
    name: "Jorge Díaz",
    desayuno: 12,
    almuerzo: 20,
    cena: 18,
    total: 50,
    monto: 400,
  },
  {
    id: 4,
    name: "Patricia Rodríguez",
    desayuno: 15,
    almuerzo: 24,
    cena: 12,
    total: 51,
    monto: 408,
  },
  {
    id: 5,
    name: "Luis Guerrero",
    desayuno: 20,
    almuerzo: 26,
    cena: 14,
    total: 60,
    monto: 480,
  },
];

const mealTypeData = [
  { tipo: "Desayuno", count: 120, monto: 600, fill: "#d97706" },
  { tipo: "Almuerzo", count: 280, monto: 2240, fill: "#ea580c" },
  { tipo: "Cena", count: 150, monto: 1200, fill: "#92400e" },
];

const topPensionistas = [
  { id: 1, name: "Carlos Méndez", consumos: 65, monto: 520, percentage: 18 },
  { id: 2, name: "Jorge Díaz", consumos: 60, monto: 480, percentage: 17 },
  { id: 3, name: "Luis Guerrero", consumos: 58, monto: 464, percentage: 16 },
  { id: 4, name: "María López", consumos: 53, monto: 424, percentage: 15 },
  { id: 5, name: "Patricia Rodríguez", consumos: 51, monto: 408, percentage: 14 },
];

export default function Reportes() {
  const [reportType, setReportType] = useState("ventas");
  const [dateFrom, setDateFrom] = useState("2026-03-28");
  const [dateTo, setDateTo] = useState("2026-04-02");

  // Cálculos de estadísticas
  const stats = useMemo(() => {
    const totalVentas = salesReport.reduce((sum, r) => sum + r.ventas, 0);
    const totalConsumos = salesReport.reduce((sum, r) => sum + r.consumos, 0);
    const totalPensionistas = salesReport.reduce((sum, r) => sum + r.pensionistas, 0);
    const promedioVenta = totalVentas / salesReport.length;

    return {
      totalVentas,
      totalConsumos,
      totalPensionistas,
      promedioVenta,
      diasReporte: salesReport.length,
    };
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Reportes Analíticos
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Dashboard de métricas y análisis de desempeño
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" style={{ color: "#aa4918" }} />
                Total de Ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                S/ {stats.totalVentas.toFixed(0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.diasReporte} días reportados
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Activity className="h-4 w-4" style={{ color: "#aa4918" }} />
                Total de Consumos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConsumos}</div>
              <p className="text-xs text-slate-500 mt-1">
                transacciones registradas
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="h-4 w-4" style={{ color: "#aa4918" }} />
                Pensionistas Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPensionistas}</div>
              <p className="text-xs text-slate-500 mt-1">personas servidas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: "#aa4918" }} />
                Promedio Diario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                S/ {stats.promedioVenta.toFixed(0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">por día</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type selector */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Tipo de Reporte
                </Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="h-10 text-sm border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ventas">Reporte de Ventas</SelectItem>
                    <SelectItem value="consumos-usuario">
                      Consumos por Pensionista
                    </SelectItem>
                    <SelectItem value="consumos-tipo">
                      Consumos por Tipo
                    </SelectItem>
                    <SelectItem value="top-pensionistas">
                      Top Pensionistas
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date from */}
              <div>
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Desde
                </Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10 text-sm border-slate-200"
                />
              </div>

              {/* Date to */}
              <div>
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Hasta
                </Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 text-sm border-slate-200"
                />
              </div>

              {/* Export button */}
              <div className="flex items-end">
                <Button
                  className="w-full h-10 text-sm font-medium"
                  style={{
                    backgroundColor: "#aa4918",
                    color: "white",
                  }}
                  onClick={() => alert("Funcionalidad de exportar estará disponible pronto")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <div className="space-y-6">
        {/* Ventas Report */}
        {reportType === "ventas" && (
          <>
            {/* Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Tendencia de Ventas Diarias</CardTitle>
                <CardDescription>
                  Evolución de ventas en el período seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesReport}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="fecha"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                      <Tooltip
                        formatter={(v) => `S/ ${v}`}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ventas"
                        stroke="#aa4918"
                        strokeWidth={2}
                        dot={{ fill: "#aa4918", r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Ventas (S/)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  Análisis de Consumos vs Ventas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesReport}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="fecha"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="ventas"
                        fill="#aa4918"
                        radius={[8, 8, 0, 0]}
                        name="Ventas (S/)"
                      />
                      <Bar
                        dataKey="consumos"
                        fill="#d97706"
                        radius={[8, 8, 0, 0]}
                        name="Consumos"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Detalle por Día</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                      <TableRow className="hover:bg-slate-50">
                        <TableHead className="text-xs font-semibold text-slate-700 h-12">
                          Fecha
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          Ventas
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          Consumos
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          Pensionistas
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          Externos
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesReport.map((r) => (
                        <TableRow
                          key={r.fecha}
                          className="border-b border-slate-100 hover:bg-slate-50/50"
                        >
                          <TableCell className="text-sm font-medium py-3">
                            {new Date(r.fecha).toLocaleDateString("es-PE", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <span
                              className="font-mono font-semibold text-sm"
                              style={{ color: "#aa4918" }}
                            >
                              S/ {r.ventas.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm py-3">
                            {r.consumos}
                          </TableCell>
                          <TableCell className="text-right text-sm py-3">
                            {r.pensionistas}
                          </TableCell>
                          <TableCell className="text-right text-sm py-3">
                            {r.externos}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-4">
                  {salesReport.map((r) => (
                    <div
                      key={r.fecha}
                      className="border border-slate-200 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-900">
                          {new Date(r.fecha).toLocaleDateString("es-PE", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                        <Badge variant="outline">
                          {r.consumos} consumos
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-500">Ventas</p>
                          <p
                            className="font-bold text-sm"
                            style={{ color: "#aa4918" }}
                          >
                            S/ {r.ventas.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Pensionistas</p>
                          <p className="font-bold text-sm">{r.pensionistas}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Externos</p>
                          <p className="font-bold text-sm">{r.externos}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Consumos por Usuario Report */}
        {reportType === "consumos-usuario" && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Consumos por Pensionista</CardTitle>
              <CardDescription>
                Detalle de consumo de cada pensionista por tipo de comida
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="text-xs font-semibold text-slate-700 h-12">
                        Pensionista
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                        Desayuno
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                        Almuerzo
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                        Cena
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                        Total Consumos
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                        Total Monto
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userConsumptions.map((u) => (
                      <TableRow
                        key={u.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50"
                      >
                        <TableCell className="text-sm font-medium py-3">
                          {u.name}
                        </TableCell>
                        <TableCell className="text-right text-sm py-3">
                          {u.desayuno}
                        </TableCell>
                        <TableCell className="text-right text-sm py-3">
                          {u.almuerzo}
                        </TableCell>
                        <TableCell className="text-right text-sm py-3">
                          {u.cena}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Badge variant="outline" className="font-semibold">
                            {u.total}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <span
                            className="font-mono font-semibold text-sm"
                            style={{ color: "#aa4918" }}
                          >
                            S/ {u.monto.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-4">
                {userConsumptions.map((u) => (
                  <div
                    key={u.id}
                    className="border border-slate-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm text-slate-900">
                        {u.name}
                      </h3>
                      <Badge
                        style={{
                          backgroundColor: "#aa4918",
                          color: "white",
                        }}
                      >
                        {u.total} consumos
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Desayuno</p>
                        <p className="font-bold text-sm">{u.desayuno}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Almuerzo</p>
                        <p className="font-bold text-sm">{u.almuerzo}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Cena</p>
                        <p className="font-bold text-sm">{u.cena}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Total Gastado</p>
                      <p
                        className="font-bold text-lg"
                        style={{ color: "#aa4918" }}
                      >
                        S/ {u.monto.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consumos por Tipo Report */}
        {reportType === "consumos-tipo" && (
          <>
            {/* Pie Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  Distribución de Consumos por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mealTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ payload }) => `${payload.tipo}: ${payload.count}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {mealTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => v}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  Comparativa: Consumos vs Monto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mealTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="tipo"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#aa4918"
                        radius={[8, 8, 0, 0]}
                        name="Cantidad"
                      />
                      <Bar
                        dataKey="monto"
                        fill="#d97706"
                        radius={[8, 8, 0, 0]}
                        name="Monto (S/)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Summary Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Resumen por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                      <TableRow className="hover:bg-slate-50">
                        <TableHead className="text-xs font-semibold text-slate-700 h-12">
                          Tipo de Comida
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          Cantidad
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          Monto Total
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          Porcentaje
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealTypeData.map((m) => (
                        <TableRow
                          key={m.tipo}
                          className="border-b border-slate-100 hover:bg-slate-50/50"
                        >
                          <TableCell className="text-sm font-medium py-3">
                            {m.tipo}
                          </TableCell>
                          <TableCell className="text-right text-sm py-3">
                            {m.count}
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <span
                              className="font-mono font-semibold text-sm"
                              style={{ color: "#aa4918" }}
                            >
                              S/ {m.monto.toFixed(0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <Badge variant="outline">
                              {(
                                (m.count /
                                  mealTypeData.reduce((s, x) => s + x.count, 0)) *
                                100
                              ).toFixed(1)}
                              %
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-4">
                  {mealTypeData.map((m) => (
                    <div
                      key={m.tipo}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-slate-900">
                          {m.tipo}
                        </h3>
                        <Badge
                          style={{
                            backgroundColor: m.fill,
                            color: "white",
                          }}
                        >
                          {(
                            (m.count /
                              mealTypeData.reduce((s, x) => s + x.count, 0)) *
                            100
                          ).toFixed(1)}
                          %
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-500">Cantidad</p>
                          <p className="font-bold text-lg">{m.count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Monto</p>
                          <p
                            className="font-bold text-lg"
                            style={{ color: "#aa4918" }}
                          >
                            S/ {m.monto.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Top Pensionistas Report */}
        {reportType === "top-pensionistas" && (
          <>
            {/* Bar Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  Top 5 Pensionistas por Consumo
                </CardTitle>
                <CardDescription>
                  Ranking de pensionistas con mayor actividad de consumo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topPensionistas}
                      layout="vertical"
                      margin={{ left: 200 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        width={190}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="consumos"
                        fill="#aa4918"
                        radius={[0, 8, 8, 0]}
                        name="Consumos"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Detalles por Pensionista</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                      <TableRow className="hover:bg-slate-50">
                        <TableHead className="text-xs font-semibold text-slate-700 h-12">
                          Posición
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12">
                          Pensionista
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          Consumos
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          Monto Total
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-700 h-12 text-right">
                          % del Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topPensionistas.map((p, idx) => (
                        <TableRow
                          key={p.id}
                          className="border-b border-slate-100 hover:bg-slate-50/50"
                        >
                          <TableCell className="text-sm font-bold py-3 w-12">
                            <Badge
                              style={{
                                backgroundColor: "#aa4918",
                                color: "white",
                              }}
                            >
                              #{idx + 1}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium py-3">
                            {p.name}
                          </TableCell>
                          <TableCell className="text-right text-sm py-3">
                            {p.consumos}
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <span
                              className="font-mono font-semibold text-sm"
                              style={{ color: "#aa4918" }}
                            >
                              S/ {p.monto.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <div className="w-full bg-orange-100 rounded-full h-2">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${p.percentage}%`,
                                  backgroundColor: "#aa4918",
                                }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-4">
                  {topPensionistas.map((p, idx) => (
                    <div
                      key={p.id}
                      className="border border-slate-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge
                            style={{
                              backgroundColor: "#aa4918",
                              color: "white",
                            }}
                            className="mb-2"
                          >
                            #{idx + 1}
                          </Badge>
                          <h3 className="font-semibold text-slate-900">
                            {p.name}
                          </h3>
                        </div>
                        <span
                          className="font-bold text-lg"
                          style={{ color: "#aa4918" }}
                        >
                          {p.percentage}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-500">Consumos</p>
                          <p className="font-bold text-lg">{p.consumos}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Monto</p>
                          <p
                            className="font-bold text-lg"
                            style={{ color: "#aa4918" }}
                          >
                            S/ {p.monto.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-orange-100 rounded-full h-2 pt-3 border-t border-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.percentage}%`,
                            backgroundColor: "#aa4918",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
