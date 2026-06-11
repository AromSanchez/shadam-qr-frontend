"use client";

import { useState } from "react";
import { usePensioner } from "../context";
import { motion } from "framer-motion";
import { User, Mail, Lock, QrCode, LogOut, Moon, Sun, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggleButton } from "@/components/theme-toggle";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = usePensioner();
  const [editMode, setEditMode] = useState<"email" | "password" | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const typeLabel = user.pensioner_type === "fixed" ? "Fijo" : user.pensioner_type === "variable" ? "Variable" : user.pensioner_type;

  const handleSaveEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Ingresa un email");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/proxy?path=/users/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Error al actualizar email");
        return;
      }
      toast.success("Email actualizado");
      setEditMode(null);
      setNewEmail("");
      await refreshUser();
    } catch {
      toast.error("Error de conexion");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Ingresa una contrasena");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contrasenas no coinciden");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/proxy?path=/users/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Error al actualizar contrasena");
        return;
      }
      toast.success("Contrasena actualizada");
      setEditMode(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Error de conexion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-950/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-cyan-200 dark:border-cyan-800/30">
          <User className="w-8 h-8 text-cyan-500" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="secondary">{typeLabel}</Badge>
          <Badge variant="outline">S/ {Number(user.balance || 0).toFixed(2)}</Badge>
        </div>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 mb-6"
      >
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-slate-500">Nombre</span>
          <span className="text-sm font-medium text-slate-800 dark:text-white">{user.name}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-slate-500">Email</span>
          <span className="text-sm font-medium text-slate-800 dark:text-white">{user.email}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-slate-500">Tipo</span>
          <span className="text-sm font-medium text-slate-800 dark:text-white capitalize">{typeLabel}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-slate-500">Saldo</span>
          <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">S/ {Number(user.balance || 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-slate-500">QR Token</span>
          <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{user.qr_token}</span>
        </div>
      </motion.div>

      {/* Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 mb-6"
      >
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Configuracion</h2>

        {/* Change Email */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 p-4">
          {editMode === "email" ? (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Nuevo email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full h-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-lg px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEmail}
                  disabled={saving}
                  className="flex-1 h-9 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar
                </button>
                <button
                  onClick={() => { setEditMode(null); setNewEmail(""); }}
                  className="flex-1 h-9 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditMode("email")}
              className="flex items-center gap-3 w-full text-left"
            >
              <Mail className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-200">Cambiar email</span>
            </button>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 p-4">
          {editMode === "password" ? (
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Nueva contrasena"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-lg px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <input
                type="password"
                placeholder="Confirmar contrasena"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-lg px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSavePassword}
                  disabled={saving}
                  className="flex-1 h-9 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar
                </button>
                <button
                  onClick={() => { setEditMode(null); setNewPassword(""); setConfirmPassword(""); }}
                  className="flex-1 h-9 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditMode("password")}
              className="flex items-center gap-3 w-full text-left"
            >
              <Lock className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-200">Cambiar contrasena</span>
            </button>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-700 dark:text-slate-200">Tema oscuro</span>
          </div>
          <ThemeToggleButton className="w-9 h-9" />
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={logout}
          className="w-full h-11 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesion
        </button>
      </motion.div>
    </div>
  );
}
