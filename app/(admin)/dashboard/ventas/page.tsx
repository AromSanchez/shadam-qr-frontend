"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { DollarSign, Search, ShoppingBag, Eye, Calendar, CreditCard, User, Grid3X3 } from "lucide-react";
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

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  clientOrTable: string;
  type: "Mesa" | "Pensionista" | string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export default function VentasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders?all=true");
      const data = await res.json();
      
      // Mapeamos los datos del API al formato requerido si es necesario
      const mappedOrders: Order[] = data.map((o: any) => ({
        id: o.id,
        // Simulamos si es mesa o pensionista para la UI basado en tableId
        clientOrTable: o.tableId ? `Mesa ${o.tableId.replace('table-', '')}` : (Math.random() > 0.5 ? "Juan Perez" : "Maria Lopez"),
        type: o.tableId ? "Mesa" : "Pensionista",
        items: o.items || [],
        total: o.total,
        paymentMethod: o.paymentMethod === 'prepago' || !o.tableId ? 'Saldo' : (o.paymentMethod || 'Efectivo'),
        status: o.status,
        createdAt: o.createdAt
      }));

      setOrders(mappedOrders);
    } catch (error) {
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
    o.clientOrTable.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case "pendiente": return "bg-amber-50 text-amber-600 border-amber-100";
      case "preparando": return "bg-blue-50 text-blue-600 border-blue-100";
      case "listo": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "entregado": return "bg-secondary text-secondary-foreground border-border";
      case "cancelado": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-muted text-muted-foreground border-border";
    }
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
            <p className="text-sm text-muted-foreground pl-8">Registro histórico de transacciones</p>
          </div>
        </div>

        {/* SEARCH & TOTAL */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Buscar por ID, cliente o método..." 
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-[#06b6d4] text-white px-6 py-3 rounded-2xl shadow-lg shadow-[#06b6d4]/20 flex items-center gap-3">
             <ShoppingBag size={20} />
             <div>
               <p className="text-[10px] uppercase font-bold opacity-80">Total Recaudado</p>
               <p className="text-xl font-black font-mono">S/ {orders.filter(o => o.status !== 'cancelado').reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p>
             </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            MOBILE: lista de cards (oculto en md+)
        ══════════════════════════════════════ */}
        <div className="flex flex-col gap-3 md:hidden">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Cargando ventas...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay ventas registradas</p>
          ) : (
            filteredOrders.map((o) => (
              <div
                key={o.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="px-4 pt-4 pb-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
                      ID: {o.id}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(o.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        {o.type === "Mesa" ? <Grid3X3 size={14} /> : <User size={14} />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{o.clientOrTable}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{o.type}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-base text-foreground">
                      S/ {o.total.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CreditCard size={14} />
                      <span className="capitalize">{o.paymentMethod}</span>
                    </div>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", getStatusColor(o.status))}>
                      {o.status}
                    </span>
                  </div>
                </div>

                {/* actions */}
                <div className="flex border-t border-border">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#06b6d4] hover:bg-muted/50 transition-colors"
                  >
                    <Eye size={13} /> Ver Detalle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ══════════════════════════════════════
            DESKTOP: tabla (oculto en mobile)
        ══════════════════════════════════════ */}
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
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No hay ventas registradas</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((o) => (
                  <TableRow key={o.id} className="border-border hover:bg-muted/40 transition-colors">
                    <TableCell className="pl-5 font-mono text-xs font-bold text-muted-foreground uppercase">
                      {o.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-foreground">
                        {o.clientOrTable}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {o.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      S/ {o.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                        <CreditCard size={14} />
                        <span className="capitalize">{o.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                          onClick={() => setSelectedOrder(o)}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* DETAIL DIALOG */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-[#06b6d4]">Detalle de la Venta</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 pt-2">
              <div className="bg-muted/50 p-4 rounded-xl border border-border flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">ID Pedido</p>
                  <p className="font-mono font-bold text-foreground">{selectedOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Cliente/Mesa</p>
                  <p className="font-bold text-foreground">{selectedOrder.clientOrTable}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Productos</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{item.quantity}</span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">S/ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-border" />
              
              <div className="flex justify-between items-center">
                <p className="font-bold text-foreground">Total</p>
                <p className="text-xl font-black text-[#06b6d4] font-mono">S/ {selectedOrder.total.toFixed(2)}</p>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#06b6d4] font-bold uppercase">Método de Pago</span>
                  <span className="capitalize text-foreground font-medium">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#06b6d4] font-bold uppercase">Fecha</span>
                  <span className="text-foreground font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
