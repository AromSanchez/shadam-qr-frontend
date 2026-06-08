"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { DollarSign, Search, ShoppingBag, Eye, Calendar, CreditCard, User, Grid3X3, Package } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SaleItem {
  id: string;
  productoId: number;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  isTakeaway: boolean;
}

interface SalePayment {
  id: string;
  method: "EFECTIVO" | "YAPE";
  amount: string | number;
}

interface Sale {
  id: string;
  sourceOrderId: string | null;
  tableNumber: string | null;
  type: "MESA" | "PARA_LLEVAR";
  customerType: "REGULAR" | "PENSIONER";
  pensionerId: number | null;
  customerLabel: string | null;
  total: string | number;
  soldAt: string;
  createdAt: string;
  items: SaleItem[];
  payments: SalePayment[];
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVenta, setSelectedVenta] = useState<Sale | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchVentas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proxy?path=${encodeURIComponent('/ventas')}`);
      if (!res.ok) {
        toast.error("Error al cargar ventas");
        setVentas([]);
        return;
      }
      const data = await res.json();
      setVentas(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error de conexion al cargar ventas");
      setVentas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const handleViewDetail = async (venta: Sale) => {
    // If items are already loaded, just show
    if (venta.items && venta.items.length > 0) {
      setSelectedVenta(venta);
      return;
    }
    // Fetch full detail
    try {
      setDetailLoading(true);
      setSelectedVenta(venta);
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(`/ventas/${venta.id}`)}`);
      if (res.ok) {
        const detail = await res.json();
        setSelectedVenta(detail);
      }
    } catch {
      // Show what we have
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredVentas = ventas.filter(v => {
    const term = search.toLowerCase();
    if (!term) return true;
    const tableLabel = v.tableNumber ? `Mesa ${v.tableNumber}` : "Para llevar";
    const customer = v.customerLabel || tableLabel;
    const paymentMethods = (v.payments || []).map(p => p.method.toLowerCase()).join(" ");
    return (
      v.id.toLowerCase().includes(term) ||
      customer.toLowerCase().includes(term) ||
      tableLabel.toLowerCase().includes(term) ||
      paymentMethods.includes(term)
    );
  });

  const totalRecaudado = ventas.reduce((sum, v) => sum + Number(v.total), 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const hour = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} ${hour}:${min}`;
  };

  const getClientLabel = (v: Sale) => {
    if (v.customerLabel) return v.customerLabel;
    if (v.tableNumber) return `Mesa ${v.tableNumber}`;
    return "Para llevar";
  };

  const getTypeLabel = (v: Sale) => {
    if (v.customerType === "PENSIONER") return "Pensionista";
    return v.type === "MESA" ? "Mesa" : "Para llevar";
  };

  const getPaymentLabel = (v: Sale) => {
    if (!v.payments || v.payments.length === 0) return "---";
    if (v.payments.length === 1) {
      return v.payments[0].method === "EFECTIVO" ? "Efectivo" : "Yape";
    }
    return "Mixto";
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <Toaster richColors position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <DollarSign className="text-[#06b6d4]" size={22} />
              <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-8">Registro historico de transacciones finalizadas</p>
          </div>
        </div>

        {/* SEARCH & TOTAL */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Buscar por ID, cliente o metodo..." 
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-[#06b6d4] text-white px-6 py-3 rounded-2xl shadow-lg shadow-[#06b6d4]/20 flex items-center gap-3">
             <ShoppingBag size={20} />
             <div>
               <p className="text-[10px] uppercase font-bold opacity-80">Total Recaudado</p>
               <p className="text-xl font-black font-mono">S/ {totalRecaudado.toFixed(2)}</p>
             </div>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="flex flex-col gap-3 md:hidden">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Cargando ventas...</p>
          ) : filteredVentas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay ventas registradas</p>
          ) : (
            filteredVentas.map((v) => (
              <div
                key={v.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="px-4 pt-4 pb-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
                      {v.id.substring(0, 8)}...
                    </span>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(v.soldAt || v.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-[#06b6d4] flex items-center justify-center flex-shrink-0">
                        {v.type === "MESA" ? <Grid3X3 size={14} /> : <Package size={14} />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{getClientLabel(v)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{getTypeLabel(v)}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-base text-foreground">
                      S/ {Number(v.total).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CreditCard size={14} />
                      <span>{getPaymentLabel(v)}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
                      Completada
                    </span>
                  </div>
                </div>

                <div className="flex border-t border-border">
                  <button
                    onClick={() => handleViewDetail(v)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#06b6d4] hover:bg-muted/50 transition-colors"
                  >
                    <Eye size={13} /> Ver Detalle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
              Historial de Ventas
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5">ID</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente/Mesa</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Total</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Pago</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right pr-5">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Cargando ventas...</TableCell>
                </TableRow>
              ) : filteredVentas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No hay ventas registradas</TableCell>
                </TableRow>
              ) : (
                filteredVentas.map((v) => (
                  <TableRow key={v.id} className="border-border hover:bg-muted/40 transition-colors">
                    <TableCell className="pl-5 font-mono text-xs font-bold text-muted-foreground uppercase">
                      {v.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {formatDate(v.soldAt || v.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-foreground">
                        {getClientLabel(v)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full",
                        v.customerType === "PENSIONER"
                          ? "bg-purple-50 text-purple-600 border border-purple-100"
                          : "bg-secondary text-secondary-foreground"
                      )}>
                        {getTypeLabel(v)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      S/ {Number(v.total).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                        <CreditCard size={14} />
                        <span>{getPaymentLabel(v)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-[#06b6d4]"
                        onClick={() => handleViewDetail(v)}
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* DETAIL DIALOG */}
      <Dialog open={!!selectedVenta} onOpenChange={() => setSelectedVenta(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-[#06b6d4]">Detalle de la Venta</DialogTitle>
          </DialogHeader>
          {selectedVenta && (
            <div className="space-y-4 pt-2">
              {/* Header info */}
              <div className="bg-muted/50 p-4 rounded-xl border border-border flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">ID Venta</p>
                  <p className="font-mono font-bold text-foreground text-sm">{selectedVenta.id.substring(0, 12)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Cliente/Mesa</p>
                  <p className="font-bold text-foreground">{getClientLabel(selectedVenta)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Productos</p>
                {detailLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Cargando detalle...</p>
                ) : selectedVenta.items && selectedVenta.items.length > 0 ? (
                  selectedVenta.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-primary/10 text-[#06b6d4] flex items-center justify-center font-bold text-xs">
                          {item.quantity}
                        </span>
                        <div>
                          <span className="font-medium text-foreground">{item.productName}</span>
                          {item.isTakeaway && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-semibold">
                              Llevar
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-muted-foreground">S/ {Number(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">Sin detalle de productos</p>
                )}
              </div>

              <hr className="border-border" />
              
              {/* Total */}
              <div className="flex justify-between items-center">
                <p className="font-bold text-foreground">Total</p>
                <p className="text-xl font-black text-[#06b6d4] font-mono">S/ {Number(selectedVenta.total).toFixed(2)}</p>
              </div>

              {/* Payments */}
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
                <p className="text-[10px] uppercase font-bold text-[#06b6d4] tracking-widest">Pagos registrados</p>
                {selectedVenta.payments && selectedVenta.payments.length > 0 ? (
                  selectedVenta.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between text-sm">
                      <span className="capitalize text-foreground font-medium">
                        {payment.method === "EFECTIVO" ? "Efectivo" : "Yape"}
                      </span>
                      <span className="font-mono font-bold text-foreground">S/ {Number(payment.amount).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Sin pagos registrados</p>
                )}
                <div className="flex justify-between text-xs pt-2 border-t border-border mt-2">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="text-foreground font-medium">
                    {new Date(selectedVenta.soldAt || selectedVenta.createdAt).toLocaleString("es-PE")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
