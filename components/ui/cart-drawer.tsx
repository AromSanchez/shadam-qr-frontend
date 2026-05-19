"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, total, removeFromCart, updateQuantity, clearCart, tableId } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableId || "Mesa Desconocida",
          items: items.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            observation: item.observation
          })),
          total: total,
          paymentMethod: "efectivo"
        })
      });

      if (response.ok) {
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white dark:bg-[#060913] rounded-t-[2rem] z-50 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.3)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                <ShoppingBag className="w-5 h-5 text-cyan-500" />
                <h2 className="text-xl font-bold font-display">Tu Pedido</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                title="Cerrar carrito"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                    <UtensilsCrossed className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">¡Pedido Enviado!</h3>
                  <p className="text-slate-500">La cocina ya está preparando tu orden.</p>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p>Aún no has elegido nada</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white mb-1">
                        <h4>{item.name}</h4>
                        <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-full p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#060913] text-slate-600 dark:text-white shadow-sm"
                            title="Disminuir cantidad"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#060913] text-slate-600 dark:text-white shadow-sm"
                            title="Aumentar cantidad"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs font-medium text-red-500 underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {!success && items.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center mb-6 text-slate-900 dark:text-white">
                  <span className="font-medium text-slate-500">Total a pagar</span>
                  <span className="text-2xl font-black font-display">S/ {total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white dark:text-[#060913] font-bold text-lg transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Confirmar Pedido"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
