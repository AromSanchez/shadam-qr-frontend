"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  ShieldCheck,
  Coffee,
  Utensils,
  Calendar,
  Settings,
  LogOut,
  CheckCircle2,
  Hourglass,
  MoonStar,
  Activity,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { HeaderProfile } from "@/components/ui/header-profile";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

// ─── Circular Progress Component ─────────────────────
function CircularProgress({ percent, label, sublabel }: { percent: number; label: string; sublabel: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        <motion.circle
          cx="96"
          cy="96"
          r={radius}
          stroke="url(#gradient-primary)"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F26522" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black text-slate-800 dark:text-white font-display leading-none">
          {label}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          {sublabel}
        </span>
      </div>
    </div>
  );
}

// ─── Data Mocks ──────────────────────────────────────
const USER_MOCK = {
  email: "ricardo.alzate@email.com",
  id: "1.092.384.XX",
  plan: "Menú Mensual Premium",
  memberSince: "Ene 2026",
};

const TODAY_MEALS = [
  { id: "desayuno", label: "Desayuno", icon: Coffee, timeStr: "07:00 AM - 10:00 AM", status: "signed", timeSigned: "08:15 AM" },
  { id: "almuerzo", label: "Almuerzo", icon: Utensils, timeStr: "12:00 PM - 03:00 PM", status: "pending" },
  { id: "cena", label: "Cena", icon: MoonStar, timeStr: "07:00 PM - 10:00 PM", status: "locked" },
];

const HISTORY_DATA = [
  {
    date: "Ayer (5 Mar)",
    items: [
      { id: 1, name: "Desayuno", time: "08:30 AM", status: "signed" },
      { id: 2, name: "Almuerzo", time: "01:15 PM", status: "signed" },
      { id: 3, name: "Cena", time: "---", status: "missed" },
    ],
  },
  {
    date: "4 Mar 2026",
    items: [
      { id: 4, name: "Desayuno", time: "07:45 AM", status: "signed" },
      { id: 5, name: "Almuerzo", time: "01:00 PM", status: "signed" },
      { id: 6, name: "Cena", time: "07:30 PM", status: "signed" },
    ],
  },
];

type SectionView = "asistencias" | "perfil";

export default function ConsumoPage() {
  const [activeSection, setActiveSection] = useState<SectionView>("asistencias");
  const { user, logout } = useAuth();

  const totalAsistencias = 28;
  const asistenciasMensualesGoal = 60;
  const percentComplete = (totalAsistencias / asistenciasMensualesGoal) * 100;
  const diasRestantes = 15;

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 dark:border-white/5 shadow-inner">
           <ShieldCheck className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white font-display mb-2">Área Privada</h2>
        <p className="text-slate-400 text-sm max-w-[240px] mb-8 leading-relaxed">Inicia sesión en la cabecera para acceder a tu panel de control y asistencias.</p>
        <HeaderProfile />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-32">
      {/* ─── Elite Header ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-900 pt-16 px-6 pb-12 rounded-b-[3.5rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-[100px] -mr-40 -mt-20" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-500/10 blur-[80px]" />
        
        <div className="relative z-10">
          <HeaderProfile />
          
          <div className="mt-10 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] font-display mb-1">
                Progreso Mensual
              </p>
              <h1 className="text-white text-3xl font-black font-display tracking-tight leading-none">
                Estadísticas <br/> 
                <span className="text-primary italic">de Consumo</span>
              </h1>
            </div>
            
            <div className="relative">
               <div className="p-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl scale-75 origin-right">
                  <CircularProgress percent={percentComplete} label={`${totalAsistencias}`} sublabel="Visitas" />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
             <div className="glass-premium rounded-3xl p-5 border-white/10 shadow-2xl bg-white/5 flex flex-col items-center">
                <p className="text-white text-2xl font-black font-display leading-none">{diasRestantes}</p>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-2">Días Restantes</p>
             </div>
             <div className="glass-premium rounded-3xl p-5 border-white/10 shadow-2xl bg-white/5 flex flex-col items-center">
                <p className="text-emerald-400 text-2xl font-black font-display leading-none">4.8</p>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-2">Rating Chef</p>
             </div>
          </div>
        </div>
      </div>

      {/* ─── Secondary Nav ───────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl pt-8 pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="px-6 flex gap-8">
          {[
            { id: "asistencias" as const, label: "Línea de Tiempo", icon: Activity },
            { id: "perfil" as const, label: "Perfil VIP", icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex flex-col items-center gap-1.5 transition-all relative pb-2 group ${
                activeSection === tab.id ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-600"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-display transition-all ${
                activeSection === tab.id ? "translate-y-0 opacity-100" : "translate-y-1 opacity-60"
              }`}>
                {tab.label}
              </span>
              {activeSection === tab.id && (
                <motion.div
                  layoutId="section-dot"
                  className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSection === "asistencias" ? (
          <motion.div
            key="asistencias"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="px-6 py-10 max-w-lg mx-auto"
          >
            {/* Today's Sequence */}
            <div className="mb-14">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                     <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-none mb-1">Hoy</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo de Asistencia</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {TODAY_MEALS.map((meal, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={meal.id}
                      className={`relative p-5 rounded-[2.2rem] border-2 flex items-center justify-between group overflow-hidden ${
                        meal.status === 'signed' ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/10' : 
                        meal.status === 'pending' ? 'bg-white dark:bg-slate-900 border-primary/20 shadow-elite' : 
                        'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5 opacity-60'
                      }`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            meal.status === 'signed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                            meal.status === 'pending' ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 
                            'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}>
                            <meal.icon className="w-7 h-7" strokeWidth={2.5} />
                          </div>
                          <div>
                             <h4 className="font-black text-slate-800 dark:text-white font-display tracking-tight leading-none mb-1.5">{meal.label}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{meal.timeStr.split('-')[0]}</p>
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-end gap-1.5">
                          {meal.status === 'signed' ? (
                             <>
                               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">SUCCESS</span>
                             </>
                          ) : meal.status === 'pending' ? (
                             <motion.div 
                               animate={{ scale: [1, 1.1, 1] }} 
                               transition={{ duration: 2, repeat: Infinity }}
                               className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                             >
                                <ArrowRight className="w-5 h-5 text-primary" />
                             </motion.div>
                          ) : (
                             <div className="w-8 h-1 bg-slate-200 rounded-full" />
                          )}
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Premium History */}
            <div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-display mb-6 ml-1">Bitácora de Accesos</h3>
               <div className="space-y-4">
                 {HISTORY_DATA.map((group, gi) => (
                   <div key={gi} className="p-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-3 ml-2">{group.date}</p>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-2 space-y-1">
                         {group.items.map(item => (
                           <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-white/5 transition-transform hover:scale-[1.01] cursor-pointer">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                   item.status === 'missed' ? 'opacity-30' : 'bg-slate-900 text-white'
                                 }`}>
                                    {item.status === 'signed' ? <span className="rotate-90 text-[8px] font-black opacity-40 uppercase tracking-[0.2em] -mt-1">{item.time.split(' ')[0]}</span> : <span className="text-xl font-bold opacity-20 relative top-0.5">!</span>}
                                 </div>
                                 <h5 className={`font-black text-xs font-display tracking-widest uppercase ${item.status === 'missed' ? 'text-slate-300 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {item.name}
                                 </h5>
                              </div>
                              <div className="flex items-center gap-2">
                                 {item.status === 'signed' ? (
                                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                 ) : <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>
        ) : (
          /* Profile Section - Premium Apple Style */
          <motion.div
            key="perfil"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-6 py-10 max-w-lg mx-auto"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-elite border border-slate-100 dark:border-white/5 overflow-hidden">
               <div className="p-10 text-center flex flex-col items-center">
                  <div className="relative mb-6">
                     <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-primary to-orange-500 p-0.5 shadow-2xl">
                        <div className="w-full h-full rounded-[30px] overflow-hidden bg-slate-900">
                           <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                        </div>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-xl rounded-2xl flex items-center justify-center border-4 border-white">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     </div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white font-display tracking-tight leading-none mb-2">{user.name}</h2>
                  <p className="text-[10px] font-black text-slate-400 capitalize bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full inline-block mb-8">
                     Miembro {USER_MOCK.plan}
                  </p>
                  
                  <div className="w-full space-y-4 pt-4 border-t border-slate-50 dark:border-white/5">
                     <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Identificación</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white font-display">{USER_MOCK.id}</span>
                     </div>
                     <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Antigüedad</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white font-display">{USER_MOCK.memberSince}</span>
                     </div>
                  </div>
               </div>
            </div>

            <Button
              onClick={logout}
              className="mt-10 w-full h-16 rounded-[2rem] bg-red-50 dark:bg-red-950/20 text-red-500 border-none shadow-none hover:bg-red-100 transition-all font-black font-display uppercase tracking-widest text-xs"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión Segura
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
