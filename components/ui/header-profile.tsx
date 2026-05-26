"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "./login-modal";
import { LogOut, User as UserIcon, Bell, ChevronDown, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export function HeaderProfile() {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <div className="flex items-center justify-between z-50">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <span className="text-slate-500 dark:text-white/40 text-[9px] font-black uppercase tracking-[0.3em] font-display">
            Premium Experience
          </span>
          <h2 className="text-slate-900 dark:text-white font-bold text-sm tracking-tight font-display">
            Restaurante Shadam
          </h2>
        </motion.div>

        <div className="flex items-center gap-3">
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative w-9 h-9 flex items-center justify-center bg-white dark:bg-white/10 backdrop-blur-xl rounded-full text-slate-700 dark:text-white/90 shrink-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/20 transition-all border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          )}

          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative w-9 h-9 flex items-center justify-center bg-white dark:bg-white/10 backdrop-blur-xl rounded-full text-slate-700 dark:text-white/90 shrink-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/20 transition-all border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-[2px] right-[2px] w-2.5 h-2.5 bg-primary rounded-full border-2 border-slate-50 dark:border-slate-900" />
          </motion.div>

          {!user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogin(true)}
              className="bg-white dark:bg-white/10 backdrop-blur-xl border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm dark:shadow-xl hover:bg-slate-50 dark:hover:bg-white/20 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </motion.button>
          ) : (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-white dark:bg-white/10 backdrop-blur-xl border border-slate-200 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/20 transition-all p-1 pr-3 rounded-full shadow-sm dark:shadow-2xl"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/30 shrink-0 shadow-inner">
                  <Image src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} alt={user.name || "Usuario"} fill sizes="32px" className="object-cover" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-800 dark:text-white text-xs font-bold whitespace-nowrap max-w-[90px] truncate font-display">
                    {(user.name || "Usuario").split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 dark:text-white/60 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                </div>
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-52 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-white/10 overflow-hidden z-50 p-2"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 mb-1.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-display">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <p className="font-bold text-slate-800 dark:text-white text-xs">
                          {user.table}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded-2xl transition-all group"
                    >
                      <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
