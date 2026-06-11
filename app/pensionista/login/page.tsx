"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PensionistaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/proxy?path=/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Credenciales incorrectas");
        return;
      }

      const data = await res.json();

      if (data.role !== "pensioner" && data.role !== "admin") {
        toast.error("Solo pensionistas pueden acceder");
        return;
      }

      if (data.first_login) {
        router.replace("/pensionista/onboarding");
      } else {
        router.replace("/pensionista");
      }
    } catch {
      toast.error("Error de conexion. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col items-center justify-center p-6">
      {/* Background accents */}
      <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 rounded-2xl mb-4">
            <UtensilsCrossed className="w-8 h-8 text-cyan-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Portal Pensionista
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ingresa con tus credenciales
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/DNI Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email o DNI
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="text"
                  required
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Tu contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* Tip */}
            <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
              Primera vez? Tu contrasena es tu DNI.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
