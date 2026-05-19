"use client";

import { useState } from "react";
import { ArrowLeft, User, Shield, CreditCard, Bell, ChevronRight, LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(false);

  const user = {
    name: "Ricardo Alzate Moreno",
    email: "ricardo.alzate@email.com",
    phone: "+51 999 888 777",
    plan: "Menú Mensual",
    memberSince: "Enero 2026",
    id: "1.092.384.XX",
  };

  const menuItems = [
    {
      id: "plan",
      label: "Mi Plan",
      description: "Menú Mensual — Activo",
      icon: CreditCard,
      color: "text-primary bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: "notifications",
      label: "Notificaciones",
      description: "Push y correo activados",
      icon: Bell,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    },
    {
      id: "security",
      label: "Seguridad",
      description: "Contraseña y acceso",
      icon: Shield,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
          </Link>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">Mi Perfil</h1>
          <div className="w-10 h-10" />
        </div>

        {/* Avatar & Info */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-orange-600 p-[3px] shadow-xl shadow-primary/20">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            </div>
            <Badge
              variant="success"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider pointer-events-none whitespace-nowrap"
            >
              Pensionista
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-2">{user.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Miembro desde {user.memberSince}</p>
        </div>
      </div>

      <main className="px-6 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">15</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Días rest.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-primary">S/ 45</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Saldo</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-emerald-500">12</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Consumos</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={item.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">{item.label}</h4>
                  <p className="text-xs text-slate-500 font-medium">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </motion.div>
          ))}

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Modo Oscuro</h4>
                <p className="text-xs text-slate-500 font-medium">{darkMode ? "Activado" : "Desactivado"}</p>
              </div>
            </div>
            <button
              title="Alternar modo oscuro"
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                darkMode ? "bg-primary" : "bg-slate-300"
              } relative`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-1 ${
                  darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full flex gap-2 text-danger border-danger/20 hover:bg-danger/5 hover:text-danger"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </Button>

        {/* Version */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
          Restaurante Inteligente v2.0 • ID: {user.id}
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
