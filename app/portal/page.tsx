"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  ChefHat, 
  Users, 
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function PortalPage() {
  const modules = [
    {
      title: "Administración",
      desc: "Gestión completa de productos, mesas y reportes.",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "bg-blue-500",
      shadow: "shadow-blue-500/20"
    },
    {
      title: "Cocina",
      desc: "Panel de pedidos en tiempo real para cocineros.",
      icon: ChefHat,
      href: "/cocina",
      color: "bg-amber-500",
      shadow: "shadow-amber-500/20"
    },
    {
      title: "Recepción",
      desc: "Validación de pensionistas y registro de consumos.",
      icon: Users,
      href: "/recepcion/validar",
      color: "bg-emerald-500",
      shadow: "shadow-emerald-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] flex flex-col items-center justify-center p-6 transition-colors duration-500">
      <div className="max-w-4xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 border border-[#aa4918]/30 bg-[#aa4918]/10 px-4 py-1.5 rounded-full mb-6">
            <span className="text-[#aa4918] text-xs font-bold tracking-[0.2em] uppercase">
              Acceso Restringido • Shadam
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Portal del Staff
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-light">
            Selecciona el módulo correspondiente a tu rol de trabajo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Link href={mod.href} className="group block h-full">
                <div className="h-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 hover:border-[#aa4918] dark:hover:border-[#aa4918] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
                  <div className={`w-14 h-14 ${mod.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${mod.shadow} group-hover:scale-110 transition-transform`}>
                    <mod.icon className="w-7 h-7" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    {mod.title}
                    <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#aa4918]" />
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-light">
                    {mod.desc}
                  </p>

                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <mod.icon className="w-24 h-24" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
