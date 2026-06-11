"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface TodayConsumption {
  mealType: string;
  amount: number;
  date: string;
}

export interface PensionerUser {
  id: string;
  name: string;
  email: string;
  role: string;
  pensioner_type: string;
  qr_token: string;
  balance: number;
  first_login: boolean;
  is_active: boolean;
  todayConsumptions: TodayConsumption[];
}

interface PensionerContextType {
  user: PensionerUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const PensionerContext = createContext<PensionerContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export function usePensioner() {
  return useContext(PensionerContext);
}

export function PensionerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PensionerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy?path=/auth/me");
      if (!res.ok) {
        setUser(null);
        router.replace("/pensionista/login");
        return;
      }
      const data = await res.json();
      if (data.role !== "pensioner" && data.role !== "admin") {
        setUser(null);
        router.replace("/pensionista/login");
        return;
      }
      setUser(data);
    } catch {
      setUser(null);
      router.replace("/pensionista/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy?path=/auth/me");
      if (!res.ok) return;
      const data = await res.json();
      setUser(data);
    } catch {
      // silently fail
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/proxy?path=/auth/logout", { method: "POST" });
    } catch {
      // proceed anyway
    }
    setUser(null);
    router.replace("/pensionista/login");
  }, [router]);

  return (
    <PensionerContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </PensionerContext.Provider>
  );
}
