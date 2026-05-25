"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────
// Mantiene compatibilidad con las páginas de /pensionista que pasan
// propiedades extra como code, dni, planType, etc.
type User = {
  role: string;
  name?: string;
  avatar?: string;
  table?: string;
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

type LoginCredentials = {
  email: string;
  password: string;
};

type LoginResult = {
  success: boolean;
  role?: string;
  first_login?: boolean;
  message?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: LoginCredentials | Partial<User> | string) => Promise<LoginResult> | void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Refresh interval: 13 min (antes de los 15 min de expiración)
const REFRESH_INTERVAL_MS = 13 * 60 * 1000;

// ─── Provider ───────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // ── Restore session on mount ──────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser({ role: data.role });
        }
      } catch {
        // No session to restore — that's fine
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Silent refresh interval ───────────────────────────
  useEffect(() => {
    if (user && user.role === "admin") {
      // Start refresh cycle
      refreshIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch("/api/auth/refresh", { method: "POST" });
          if (!res.ok) {
            // Refresh failed → session expired
            setUser(null);
            router.push("/login");
          }
        } catch {
          // Network error — don't logout immediately, retry next cycle
          console.warn("[Auth] Refresh failed, will retry next cycle");
        }
      }, REFRESH_INTERVAL_MS);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    } else {
      // Clear interval if not admin
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
  }, [user, router]);

  // ── Login ─────────────────────────────────────────────
  // Soporta 3 modos para compatibilidad:
  // 1. LoginCredentials { email, password } → auth real contra backend
  // 2. Partial<User> → login local (usado por /pensionista mock)
  // 3. string → login local legacy (nombre)
  const login = useCallback(
    (userData: LoginCredentials | Partial<User> | string): Promise<LoginResult> | void => {
      // Mode 1: Real auth credentials
      if (
        typeof userData === "object" &&
        "email" in userData &&
        "password" in userData &&
        userData.email &&
        userData.password
      ) {
        const credentials = userData as LoginCredentials;
        return (async (): Promise<LoginResult> => {
          try {
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              return {
                success: false,
                message: data.message || "Credenciales inválidas",
              };
            }

            // Backend returns { first_login, role }
            if (data.role !== "admin") {
              // Logout immediately — this frontend is admin-only
              await fetch("/api/auth/logout", { method: "POST" });
              return {
                success: false,
                message: "Acceso restringido. Esta área es solo para administradores.",
              };
            }

            setUser({ role: data.role });

            return {
              success: true,
              role: data.role,
              first_login: data.first_login,
            };
          } catch {
            return {
              success: false,
              message: "Error de conexión con el servidor",
            };
          }
        })();
      }

      // Mode 2: Partial<User> object (used by /pensionista pages)
      if (typeof userData === "object") {
        const partialUser = userData as Partial<User>;
        setUser({
          role: partialUser.role || "cliente",
          name: partialUser.name || "Usuario",
          avatar:
            partialUser.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          ...partialUser,
        } as User);
        return;
      }

      // Mode 3: string (legacy — used by old mock login)
      if (typeof userData === "string") {
        setUser({
          name: userData || "Usuario Invitado",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          table: "Mesa 12",
          role: "cliente",
        });
        return;
      }
    },
    []
  );

  // ── Logout ────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if API fails, clear local state
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
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
