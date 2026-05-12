"use client";

import { cn } from "@/lib/utils";
import { Utensils, QrCode, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";

type TabId = "menu" | "qr" | "consumo";

export function BottomNav() {
  const pathname = usePathname();

  const getActiveTab = (): TabId => {
    if (pathname === "/consumo") return "consumo";
    if (pathname === "/qr") return "qr";
    return "menu";
  };

  const activeTab = getActiveTab();

  const tabs: { id: TabId; label: string; icon: React.ElementType; href: string; isPrimary?: boolean }[] = [
    { id: "menu", label: "Menú", icon: Utensils, href: "/" },
    { id: "qr", label: "Mi QR", icon: QrCode, href: "/qr", isPrimary: true },
    { id: "consumo", label: "Consumo", icon: BarChart3, href: "/consumo" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6" aria-label="Navegación principal">
      <div className="max-w-md mx-auto relative">
        {/* Floating Glass Container */}
        <div className="absolute inset-0 glass-premium rounded-[2.5rem] shadow-elite border-t border-white/40" />
        
        <div className="relative flex items-center justify-around px-2 h-20">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            if (tab.isPrimary) {
              return (
                <div key={tab.id} className="relative -top-6">
                  <Link href={tab.href} className="flex flex-col items-center group" aria-label={tab.label}>
                    <div className="relative">
                      {/* Active outer pulse */}
                      {isActive && (
                        <motion.div 
                          layoutId="primary-pulse"
                          className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <motion.div 
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          "relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl",
                          "bg-gradient-to-br from-primary via-orange-500 to-orange-600",
                          "ring-4 ring-white dark:ring-slate-900 shadow-primary/40"
                        )}
                      >
                        <Icon className="w-7 h-7" strokeWidth={2.5} />
                      </motion.div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-black mt-2 tracking-widest uppercase font-display transition-colors",
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                    )}>
                      {tab.label}
                    </span>
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex flex-col items-center justify-center w-20 h-full group relative"
                aria-label={tab.label}
              >
                <div className="relative flex flex-col items-center">
                  <motion.div
                    animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                    className="relative z-10"
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6 mb-1.5 transition-all duration-300",
                        isActive
                          ? "text-primary drop-shadow-[0_0_8px_rgba(242,101,34,0.4)]"
                          : "text-slate-400 group-hover:text-slate-600"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.div>
                  <span
                    className={cn(
                      "text-[10px] font-bold tracking-widest uppercase font-display transition-all duration-300",
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  >
                    {tab.label}
                  </span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(242,101,34,0.8)]"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
