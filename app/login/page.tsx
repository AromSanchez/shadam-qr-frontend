"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await login({ email, password });

      if (result && !result.success) {
        setError(result.message || "Credenciales inválidas");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      router.push("/portal");
    } catch {
      setError("Error de conexión con el servidor de autenticación");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* ─── FONDOS CON GLOW PREMIUM DE SHADAM ─── */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Retícula decorativa de fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Contenedor con efecto glassmorphism */}
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* Línea de brillo premium superior */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

          {/* Encabezado */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 rounded-full mb-6">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                Portal de Administración
              </span>
            </div>
            
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">
              SHADAM <span className="text-cyan-400 font-light">STAFF</span>
            </h1>
            <p className="text-slate-400 text-sm font-light">
              Ingresa tus credenciales autorizadas de administrador.
            </p>
          </div>

          {/* Mensajes de Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pl-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="admin@system.com"
                  className="w-full h-13 bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/10 transition-all text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 pl-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full h-13 bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/10 transition-all text-white placeholder-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold mt-4 shadow-lg shadow-cyan-500/15 overflow-hidden group hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-85"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? "Autenticando..." : "Ingresar al Sistema"}
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500 font-light flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>Shadam POS & Recepción • Sistema de Control Interno</span>
        </div>
      </motion.div>
    </div>
  );
}
