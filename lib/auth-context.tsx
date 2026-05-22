"use client";

import React, { createContext, useContext, useState } from "react";

type User = {
  name: string;
  avatar: string;
  table?: string;
  role?: string;
  code?: string;
  dni?: string;
  planType?: string;
  startDate?: string;
  endDate?: string;
  breakfastCredits?: number;
  lunchCredits?: number;
  dinnerCredits?: number;
  status?: string;
  balance?: number;
};

type AuthContextType = {
  user: User | null;
  login: (userData: Partial<User> | string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: Partial<User> | string = "Usuario") => {
    if (typeof userData === "string") {
      setUser({
        name: userData || "Usuario Invitado",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        table: "Mesa 12",
        role: "cliente",
      });
    } else {
      setUser({
        name: userData.name || "Usuario",
        avatar: userData.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        ...userData,
      } as User);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
