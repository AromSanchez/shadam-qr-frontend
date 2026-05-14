"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { Product } from "./mock-db"; // We will use the type

export interface CartItem extends Product {
  quantity: number;
  observation?: string;
}

interface CartContextType {
  items: CartItem[];
  tableId: string | null;
  setTableId: (id: string) => void;
  addToCart: (product: Product, quantity?: number, observation?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateObservation: (productId: string, observation: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);

  const addToCart = (product: Product, quantity = 1, observation = "") => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(item => item.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity, observation: observation || item.observation }
            : item
        );
      }
      return [...currentItems, { ...product, quantity, observation }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((currentItems) => currentItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((currentItems) =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateObservation = (productId: string, observation: string) => {
    setItems((currentItems) =>
      currentItems.map(item =>
        item.id === productId ? { ...item, observation } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider value={{ items, tableId, setTableId, addToCart, removeFromCart, updateQuantity, updateObservation, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
