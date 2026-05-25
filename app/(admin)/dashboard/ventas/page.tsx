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
import { DollarSign, Search, Calendar, CreditCard, ShoppingBag, Eye } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  tableId: string;
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
      setOrders(data);
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
    o.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case "pendiente": return "bg-amber-50 text-amber-600 border-amber-100";
      case "preparando": return "bg-blue-50 text-blue-600 border-blue-100";
      case "listo": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "entregado": return "bg-slate-50 text-secondary-foreground border-slate-100";
      case "cancelado": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-muted/50 text-gray-600 border-border";
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
              <h1 className="text-2xl font-bold text-foreground">Ventas y Pedidos</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-8">Registro histórico de todas las transacciones</p>
          </div>
        </div>

        {/* SEARCH & TOTAL */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Buscar por ID o método..." 
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-[#06b6d4] text-white px-6 py-3 rounded-2xl shadow-lg shadow-orange-900/20 flex items-center gap-3">
             <ShoppingBag size={20} />
             <div>
               <p className="text-[10px] uppercase font-bold opacity-80">Total Recaudado</p>
               <p className="text-xl font-black font-mono">S/ {orders.filter(o => o.status !== 'cancelado').reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p>
             </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>ID Pedido</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Fecha / Hora</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right pr-6">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Cargando ventas...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No hay pedidos registrados</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-500 uppercase">
                      {o.id}
                    </TableCell>
                    <TableCell className="font-bold">
                      Mesa {o.tableId.replace('table-', '')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-secondary-foreground">
                        <CreditCard size={14} />
                        <span className="capitalize">{o.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-secondary-foreground">
                        <p className="font-medium">{new Date(o.createdAt).toLocaleDateString()}</p>
                        <p className="opacity-70">{new Date(o.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-black text-slate-900">
                      S/ {o.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                        onClick={() => setSelectedOrder(o)}
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
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#06b6d4]">Detalle del Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">ID Pedido</p>
                  <p className="font-mono font-bold text-slate-700">{selectedOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Mesa</p>
                  <p className="font-bold text-slate-700">{selectedOrder.tableId}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Productos</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-orange-100 text-[#06b6d4] flex items-center justify-center font-bold text-xs">{item.quantity}</span>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-500">S/ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-slate-100" />
              
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-900">Total</p>
                <p className="text-xl font-black text-[#06b6d4] font-mono">S/ {selectedOrder.total.toFixed(2)}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-border">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-orange-600 font-bold uppercase">Método de Pago</span>
                  <span className="capitalize text-orange-700 font-medium">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-orange-600 font-bold uppercase">Fecha</span>
                  <span className="text-orange-700 font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
