"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  Loader2,
  Search,
  TrendingUp,
  Users,
  DollarSign,
  UtensilsCrossed,
  FileSpreadsheet,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ─── Types ───────────────────────────────────────────────────────────────

interface SaleItem {
  name: string;
  quantity: number;
  price: number;
}

interface SaleRecord {
  id: number | string;
  date: string;
  client: string;
  type: "MESA" | "PARA_LLEVAR" | string;
  items: SaleItem[] | string;
  total: number;
  payment_method: string;
}

interface ConsumptionRecord {
  id: number | string;
  date: string;
  pensioner_name: string;
  pensioner_type: "ESTUDIANTE" | "TRABAJADOR" | string;
  meal: string;
  amount_charged: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  // Parse safely: if it's an ISO string, slice the date part to avoid timezone shifts
  const datePart = dateStr.split("T")[0]; // "2026-06-22"
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getMonthStart() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<"ventas" | "consumos" | "movimientos">("ventas");

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <BarChart3 className="text-[#06b6d4]" size={22} />
              <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-8">
              Consulta y exporta reportes de ventas, consumos y movimientos de saldo
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border w-fit flex-wrap">
            <button
              onClick={() => setActiveTab("ventas")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "ventas"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <DollarSign size={15} />
              Ventas
            </button>
            <button
              onClick={() => setActiveTab("consumos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "consumos"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users size={15} />
              Consumos
            </button>
            <button
              onClick={() => setActiveTab("movimientos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "movimientos"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp size={15} />
              Movimientos Saldo
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "ventas" && <VentasTab />}
          {activeTab === "consumos" && <ConsumosTab />}
          {activeTab === "movimientos" && <MovimientosTab />}
        </div>
      </div>
    </>
  );
}

// ─── Ventas Tab ──────────────────────────────────────────────────────────

function VentasTab() {
  const [fromDate, setFromDate] = useState(getMonthStart());
  const [toDate, setToDate] = useState(getToday());
  const [type, setType] = useState("todos");
  const [data, setData] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (type !== "todos") params.set("type", type);

      const res = await fetch(
        `/api/proxy?path=${encodeURIComponent(`/reports/sales?${params.toString()}`)}`,
        { credentials: "include" }
      );
      const json = await res.json();
      const rawData: any[] = Array.isArray(json) ? json : json.data ?? [];
      const mappedData: SaleRecord[] = rawData.map((sale: any) => ({
        id: sale.id,
        date: sale.soldAt ?? sale.date ?? "",
        client: sale.pensioner?.name || sale.customerLabel || "Regular",
        type: sale.type ?? "-",
        items: (sale.items || []).map((item: any) => ({
          name: item.productName ?? item.name ?? "?",
          quantity: item.quantity ?? 1,
          price: Number(item.unitPrice ?? item.price ?? 0),
        })),
        total: Number(sale.total ?? 0),
        payment_method:
          (sale.payments || [])
            .map((p: any) => {
              const method = p.method ?? "";
              if (method === "EFECTIVO") return "Efectivo";
              if (method === "YAPE") return "Yape";
              if (method === "SALDO") return "Saldo";
              return method;
            })
            .join(", ") || "-",
      }));

      setData(mappedData);
      setFetched(true);
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al cargar ventas");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, type]);

  const handleExport = async () => {
    try {
      setExporting(true);

      // Try backend export first
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (type !== "todos") params.set("type", type);

      const res = await fetch(
        `/api/proxy?path=${encodeURIComponent(`/reports/sales/export?${params.toString()}`)}`,
        { credentials: "include" }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ventas_${fromDate}_${toDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Reporte exportado");
        return;
      }

      // Fallback: client-side export with exceljs
      if (data.length === 0) {
        toast.error("No hay datos para exportar");
        return;
      }

      await exportSalesClientSide();
    } catch {
      toast.error("Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  const exportSalesClientSide = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Ventas");

    // Headers
    sheet.columns = [
      { header: "Fecha", key: "date", width: 15 },
      { header: "Cliente", key: "client", width: 25 },
      { header: "Tipo", key: "type", width: 15 },
      { header: "Items", key: "items", width: 40 },
      { header: "Total", key: "total", width: 15 },
      { header: "Método Pago", key: "payment_method", width: 18 },
    ];

    // Style headers
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF06B6D4" },
    };
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Add data
    for (const sale of data) {
      const itemsStr =
        typeof sale.items === "string"
          ? sale.items
          : Array.isArray(sale.items)
          ? sale.items.map((i) => `${i.name} x${i.quantity}`).join(", ")
          : "";

      sheet.addRow({
        date: formatDate(sale.date),
        client: sale.client || "-",
        type: sale.type === "MESA" ? "Mesa" : sale.type === "PARA_LLEVAR" ? "Para Llevar" : sale.type,
        items: itemsStr,
        total: Number(sale.total),
        payment_method: sale.payment_method || "-",
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `ventas_${fromDate}_${toDate}.xlsx`);
    toast.success("Reporte exportado");
  };

  // Summary calculations
  const totalSales = data.length;
  const totalRevenue = data.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const avgPerSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-40 focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-40 focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
            >
              <option value="todos">Todos</option>
              <option value="MESA">Mesa</option>
              <option value="PARA_LLEVAR">Para Llevar</option>
            </select>
          </div>
          <Button
            onClick={fetchSales}
            disabled={loading}
            className="gap-2 bg-[#06b6d4] hover:bg-primary/90 text-white"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Consultar
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || data.length === 0}
            variant="outline"
            className="gap-2"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {fetched && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center">
                <FileSpreadsheet size={14} className="text-[#06b6d4]" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Total ventas</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalSales}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign size={14} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Ingresos totales</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp size={14} className="text-amber-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Promedio por venta</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(avgPerSale)}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
          <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
            Registro de ventas
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5">
                Fecha
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Cliente
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tipo
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Items
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                Total
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right pr-5">
                Método Pago
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Cargando ventas...
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && fetched && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                  No se encontraron ventas en el rango seleccionado
                </TableCell>
              </TableRow>
            )}
            {!loading && !fetched && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                  Selecciona un rango de fechas y presiona &quot;Consultar&quot;
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              data.map((sale) => {
                const itemsStr =
                  typeof sale.items === "string"
                    ? sale.items
                    : Array.isArray(sale.items)
                    ? sale.items.map((i) => `${i.name} x${i.quantity}`).join(", ")
                    : "-";

                return (
                  <TableRow key={sale.id} className="border-border hover:bg-muted/40 transition-colors">
                    <TableCell className="pl-5 text-sm text-foreground">
                      {formatDate(sale.date)}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {sale.client || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          sale.type === "MESA"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {sale.type === "MESA" ? "Mesa" : sale.type === "PARA_LLEVAR" ? "Para Llevar" : sale.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {itemsStr}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-sm text-foreground">
                      {formatCurrency(Number(sale.total))}
                    </TableCell>
                    <TableCell className="text-right pr-5 text-sm text-muted-foreground">
                      {sale.payment_method || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Consumos Tab ────────────────────────────────────────────────────────

function ConsumosTab() {
  const [fromDate, setFromDate] = useState(getMonthStart());
  const [toDate, setToDate] = useState(getToday());
  const [pensionerType, setPensionerType] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<ConsumptionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchConsumptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (pensionerType !== "todos") params.set("pensionerType", pensionerType);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(
        `/api/proxy?path=${encodeURIComponent(`/reports/consumptions?${params.toString()}`)}`,
        { credentials: "include" }
      );
      const json = await res.json();
      const rawData: any[] = Array.isArray(json) ? json : json.data ?? [];
      const mappedData: ConsumptionRecord[] = rawData.map((c: any) => ({
        id: c.id,
        date: c.date ?? c.createdAt ?? "",
        pensioner_name: c.user?.name ?? "-",
        pensioner_type: c.user?.pensioner_type ?? "-",
        meal: c.mealType ?? c.meal ?? "-",
        amount_charged: Number(c.amount ?? c.amount_charged ?? 0),
      }));

      setData(mappedData);
      setFetched(true);
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al cargar consumos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, pensionerType, searchTerm]);

  const handleExport = async () => {
    try {
      setExporting(true);

      // Try backend export first
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (pensionerType !== "todos") params.set("pensionerType", pensionerType);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(
        `/api/proxy?path=${encodeURIComponent(`/reports/consumptions/export?${params.toString()}`)}`,
        { credentials: "include" }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `consumos_${fromDate}_${toDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Reporte exportado");
        return;
      }

      // Fallback: client-side export
      if (data.length === 0) {
        toast.error("No hay datos para exportar");
        return;
      }

      await exportConsumptionsClientSide();
    } catch {
      toast.error("Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  const exportConsumptionsClientSide = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Consumos");

    // Headers
    sheet.columns = [
      { header: "Fecha", key: "date", width: 15 },
      { header: "Pensionista", key: "pensioner_name", width: 25 },
      { header: "Tipo", key: "pensioner_type", width: 15 },
      { header: "Comida", key: "meal", width: 15 },
      { header: "Monto cobrado", key: "amount_charged", width: 18 },
    ];

    // Style headers
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF06B6D4" },
    };

    // Add data
    for (const record of data) {
      sheet.addRow({
        date: formatDate(record.date),
        pensioner_name: record.pensioner_name,
        pensioner_type:
          record.pensioner_type === "ESTUDIANTE"
            ? "Estudiante"
            : record.pensioner_type === "TRABAJADOR"
            ? "Trabajador"
            : record.pensioner_type,
        meal: record.meal,
        amount_charged: Number(record.amount_charged),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `consumos_${fromDate}_${toDate}.xlsx`);
    toast.success("Reporte exportado");
  };

  // Summary calculations
  const totalConsumptions = data.length;
  const totalCharged = data.reduce((sum, c) => sum + Number(c.amount_charged || 0), 0);
  // Calculate unique days for average
  const uniqueDays = new Set(data.map((c) => c.date?.split("T")[0])).size;
  const avgDaily = uniqueDays > 0 ? totalCharged / uniqueDays : 0;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-40 focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-40 focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Tipo pensionista</label>
            <select
              value={pensionerType}
              onChange={(e) => setPensionerType(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
            >
              <option value="todos">Todos</option>
              <option value="ESTUDIANTE">Estudiante</option>
              <option value="TRABAJADOR">Trabajador</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Buscar pensionista</label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre o DNI..."
              className="w-44 focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
            />
          </div>
          <Button
            onClick={fetchConsumptions}
            disabled={loading}
            className="gap-2 bg-[#06b6d4] hover:bg-primary/90 text-white"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Consultar
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || data.length === 0}
            variant="outline"
            className="gap-2"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {fetched && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center">
                <UtensilsCrossed size={14} className="text-[#06b6d4]" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Total consumos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalConsumptions}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign size={14} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Total cobrado</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCharged)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar size={14} className="text-amber-600" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Promedio diario</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(avgDaily)}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
          <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
            Registro de consumos
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5">
                Fecha
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pensionista
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tipo
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Comida
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right pr-5">
                Monto cobrado
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Cargando consumos...
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && fetched && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  No se encontraron consumos en el rango seleccionado
                </TableCell>
              </TableRow>
            )}
            {!loading && !fetched && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  Selecciona un rango de fechas y presiona &quot;Consultar&quot;
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              data.map((record) => (
                <TableRow key={record.id} className="border-border hover:bg-muted/40 transition-colors">
                  <TableCell className="pl-5 text-sm text-foreground">
                    {formatDate(record.date)}
                  </TableCell>
                  <TableCell className="text-sm text-foreground font-medium">
                    {record.pensioner_name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        record.pensioner_type === "ESTUDIANTE"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : record.pensioner_type === "TRABAJADOR"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {record.pensioner_type === "ESTUDIANTE"
                        ? "Estudiante"
                        : record.pensioner_type === "TRABAJADOR"
                        ? "Trabajador"
                        : record.pensioner_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.meal}
                  </TableCell>
                  <TableCell className="text-right pr-5 font-mono font-bold text-sm text-foreground">
                    {formatCurrency(Number(record.amount_charged))}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Movimientos de Saldo Tab ────────────────────────────────────────────

interface MovementRecord {
  id: string;
  createdAt: string;
  type: "RECARGA" | "CONSUMO" | "AJUSTE";
  amount: number | string;
  balance: number | string;
  description: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    pensioner_type: string | null;
  };
}

function MovimientosTab() {
  const [fromDate, setFromDate] = useState(getMonthStart());
  const [toDate, setToDate] = useState(getToday());
  const [typeFilter, setTypeFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<MovementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (typeFilter !== "todos") params.set("type", typeFilter);

      const res = await fetch(
        `/api/proxy?path=${encodeURIComponent(`/reports/movements?${params.toString()}`)}`,
        { credentials: "include" }
      );

      if (res.ok) {
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } else {
        toast.error("Error al cargar movimientos");
        setData([]);
      }
    } catch {
      toast.error("Error de conexión");
      setData([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [fromDate, toDate, typeFilter]);

  const filteredData = data.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.user.name.toLowerCase().includes(term) ||
      m.user.email.includes(term) ||
      (m.description || "").toLowerCase().includes(term)
    );
  });

  const totalRecargas = filteredData
    .filter((m) => m.type === "RECARGA")
    .reduce((sum, m) => sum + Math.abs(Number(m.amount)), 0);

  const totalConsumos = filteredData
    .filter((m) => m.type === "CONSUMO")
    .reduce((sum, m) => sum + Math.abs(Number(m.amount)), 0);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (typeFilter !== "todos") params.set("type", typeFilter);

      const res = await fetch(
        `/api/proxy?path=${encodeURIComponent(`/reports/movements/export?${params.toString()}`)}`,
        { credentials: "include" }
      );

      if (res.ok) {
        const blob = await res.blob();
        saveAs(blob, `movimientos_saldo_${fromDate}_${toDate}.xlsx`);
        toast.success("Reporte exportado");
      } else {
        // Fallback: client-side export
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet("Movimientos de Saldo");
        ws.columns = [
          { header: "Fecha", key: "fecha", width: 20 },
          { header: "Pensionista", key: "pensionista", width: 25 },
          { header: "DNI", key: "dni", width: 12 },
          { header: "Tipo", key: "tipo", width: 12 },
          { header: "Monto", key: "monto", width: 15 },
          { header: "Saldo Resultante", key: "saldo", width: 18 },
          { header: "Descripción", key: "descripcion", width: 40 },
        ];
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E75B6" } };

        for (const m of filteredData) {
          ws.addRow({
            fecha: new Date(m.createdAt).toLocaleString("es-PE"),
            pensionista: m.user.name,
            dni: m.user.email,
            tipo: m.type,
            monto: Number(m.amount),
            saldo: Number(m.balance),
            descripcion: m.description || "-",
          });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `movimientos_saldo_${fromDate}_${toDate}.xlsx`);
        toast.success("Reporte exportado (local)");
      }
    } catch {
      toast.error("Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Filtros
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 min-w-0">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Desde</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="focus-visible:ring-[#06b6d4]"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Hasta</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="focus-visible:ring-[#06b6d4]"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
            >
              <option value="todos">Todos</option>
              <option value="RECARGA">Recargas</option>
              <option value="CONSUMO">Consumos</option>
              <option value="AJUSTE">Ajustes</option>
            </select>
          </div>
          <Button
            onClick={fetchData}
            disabled={loading}
            className="gap-2 bg-[#06b6d4] hover:bg-primary/90 text-white shrink-0"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Consultar
          </Button>
        </div>
      </div>

      {!fetched ? (
        <div className="text-center py-16">
          <Calendar size={40} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Selecciona un rango de fechas y haz click en Consultar
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp size={14} className="text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Total movimientos</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign size={14} className="text-green-600" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Total recargas</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRecargas)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <UtensilsCrossed size={14} className="text-red-500" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Total consumos</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(totalConsumos)}</p>
            </div>
          </div>

          {/* Search + Export */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input
                placeholder="Buscar por nombre, DNI o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 focus-visible:ring-[#06b6d4]"
              />
            </div>
            <Button
              onClick={handleExport}
              disabled={exporting || filteredData.length === 0}
              variant="outline"
              className="gap-2 border-[#06b6d4] text-[#06b6d4] hover:bg-primary/10 shrink-0"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Exportar Excel
            </Button>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
                Movimientos de saldo ({filteredData.length})
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase pl-5">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Pensionista</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Tipo</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Descripción</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">Monto</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right pr-5">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      <Loader2 size={20} className="animate-spin inline-block mr-2" />
                      Cargando movimientos...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No hay movimientos en este rango
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  filteredData.map((m) => (
                    <TableRow key={m.id} className="border-border hover:bg-muted/40 transition-colors">
                      <TableCell className="pl-5 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(m.createdAt)}
                        <span className="text-xs ml-1.5 text-muted-foreground/60">
                          {new Date(m.createdAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-sm font-medium text-foreground">{m.user.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({m.user.email})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            m.type === "RECARGA"
                              ? "bg-green-500/10 text-green-600 border border-green-200/50"
                              : m.type === "CONSUMO"
                              ? "bg-red-500/10 text-red-500 border border-red-200/50"
                              : "bg-amber-500/10 text-amber-600 border border-amber-200/50"
                          }`}
                        >
                          {m.type === "RECARGA" ? "Recarga" : m.type === "CONSUMO" ? "Consumo" : "Ajuste"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {m.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            Number(m.amount) >= 0 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {Number(m.amount) >= 0 ? "+" : ""}
                          {formatCurrency(Math.abs(Number(m.amount)))}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-5 font-mono text-sm text-foreground">
                        {formatCurrency(Number(m.balance))}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
