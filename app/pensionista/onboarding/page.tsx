"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, CheckCircle, SkipForward } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("Las contrasenas no coinciden");
      return;
    }

    if (!email && !password) {
      toast.error("Ingresa al menos un cambio o usa 'Omitir'");
      return;
    }

    try {
      setLoading(true);
      const body: Record<string, string> = {};
      if (email.trim()) body.email = email.trim();
      if (password.trim()) body.password = password.trim();

      const res = await fetch("/api/proxy?path=/users/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Error al guardar cambios");
        return;
      }

      toast.success("Perfil actualizado correctamente");
      router.replace("/pensionista");
    } catch {
      toast.error("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setSkipping(true);
      const res = await fetch("/api/proxy?path=/users/me/skip-onboarding", {
        method: "PATCH",
      });

      if (!res.ok) {
        toast.error("Error al omitir");
        return;
      }

      router.replace("/pensionista");
    } catch {
      toast.error("Error de conexion");
    } finally {
      setSkipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col items-center justify-center p-6">
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            Bienvenido!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Puedes actualizar tu correo y contrasena. Es opcional.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <form onSubmit={handleSave} className="space-y-4">
            {/* New Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nuevo email (opcional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="nuevo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nueva contrasena (opcional)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Nueva contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            {password && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirmar contrasena
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Repite la contrasena"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Guardar cambios"
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={skipping}
                className="w-full h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 active:scale-[0.98]"
              >
                {skipping ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <SkipForward className="w-4 h-4" />
                    Omitir
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
