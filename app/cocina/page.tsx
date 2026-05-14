"use client";

import { useEffect, useState } from "react";
import { Order, db } from "@/lib/mock-db";
import { ChefHat, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial active orders
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(console.error);

    // 2. Open Server-Sent Events connection for real-time updates
    const eventSource = new EventSource("/api/orders/stream");
    
    eventSource.addEventListener("new_order", (e) => {
      const newOrder = JSON.parse(e.data);
      setOrders(prev => [...prev, newOrder]);
      // Play a sound to alert the kitchen
      const audio = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=ding-idea-40142.mp3");
      audio.play().catch(e => console.log("Audio play failed:", e));
    });

    eventSource.addEventListener("order_updated", (e) => {
      const updatedOrder = JSON.parse(e.data);
      setOrders(prev => {
        // If order is delivered or cancelled, remove it from kitchen view
        if (updatedOrder.status === "entregado" || updatedOrder.status === "cancelado") {
          return prev.filter(o => o.id !== updatedOrder.id);
        }
        return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      });
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Optimistic update
        setOrders(prev => {
          if (newStatus === "entregado" || newStatus === "cancelado") {
            return prev.filter(o => o.id !== orderId);
          }
          return prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o);
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente": return "bg-red-500 text-white";
      case "en_preparacion": return "bg-amber-500 text-white";
      case "listo": return "bg-emerald-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando Sistema de Cocina...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
          <ChefHat className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white font-display tracking-tight">Cocina en Vivo</h1>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Conectado en tiempo real
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map(order => (
          <div key={order.id} className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
            {/* Header */}
            <div className={`p-4 flex justify-between items-center ${getStatusColor(order.status)}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black">Mesa {db.tables.find(t => t.id === order.tableId)?.number || order.tableId.replace("table_", "")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold bg-black/20 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Items */}
            <div className="p-6 flex-1 bg-slate-900/50">
              <ul className="space-y-4">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-white shrink-0">
                      {item.quantity}
                    </span>
                    <div>
                      <h4 className="text-white font-bold text-lg leading-tight">{item.name}</h4>
                      {item.observation && (
                        <div className="flex items-start gap-1.5 mt-1.5 text-amber-400 text-sm font-medium bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <p>{item.observation}</p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 grid grid-cols-3 gap-2">
              <button 
                onClick={() => updateOrderStatus(order.id, "pendiente")}
                className={`py-3 rounded-xl font-bold text-sm transition-colors ${order.status === "pendiente" ? "bg-slate-800 text-white cursor-default" : "bg-transparent text-slate-500 hover:bg-slate-800"}`}
              >
                Pendiente
              </button>
              <button 
                onClick={() => updateOrderStatus(order.id, "en_preparacion")}
                className={`py-3 rounded-xl font-bold text-sm transition-colors shadow-lg ${order.status === "en_preparacion" ? "bg-amber-500 text-slate-900 shadow-amber-500/20" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                Preparando
              </button>
              <button 
                onClick={() => updateOrderStatus(order.id, "listo")}
                className={`py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-lg ${order.status === "listo" ? "bg-emerald-500 text-slate-900 shadow-emerald-500/20" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                <CheckCircle2 className="w-4 h-4" /> Listo
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
            <CheckCircle2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-light">No hay pedidos pendientes en cocina.</p>
          </div>
        )}
      </div>
    </div>
  );
}
