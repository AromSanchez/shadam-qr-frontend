"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
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

type SectionView = "asistencias" | "perfil";

type ConsumptionData = {
  id: string;
  mealType: "desayuno" | "almuerzo" | "cena";
  date: string;
  time: string;
  status: "confirmado" | "anulado";
};

type PensionistProfile = {
  fullName: string;
  dni: string;
  planType: string;
  startDate: string;
  endDate: string;
  balance?: number;
  breakfastCredits?: number;
  lunchCredits?: number;
  dinnerCredits?: number;
  consumptions: ConsumptionData[];
};

export default function ConsumoPage() {
  const [activeSection, setActiveSection] = useState<SectionView>("asistencias");
  const { user, logout, login } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PensionistProfile | null>(null);

  useEffect(() => {
    if (!user || user.role !== "pensionista") {
      router.replace("/pensionista");
      return;
    }

    const fetchFreshData = async () => {
      if (!user.code) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch("/api/pensionists/validate-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode: user.code })
        });
        
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Error al obtener datos");
        } else {
          const data = await res.json();
          setProfile(data);
          
          // Opcional: sincronizar balance
          if (data.balance !== undefined && user.balance !== data.balance) {
             login({ ...user, balance: data.balance });
          }
        }
      } catch (e) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchFreshData();
  }, [user, router, login]);

  if (!user || user.role !== "pensionista" || loading) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Process Data ---
  const consumptions = profile?.consumptions || [];
  
  // Agrupar por fecha
  const historyMap = consumptions.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, ConsumptionData[]>);

  const historyData = Object.keys(historyMap).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(date => {
    return {
      date: date,
      items: historyMap[date].map((c, i) => ({
        id: c.id || i.toString(),
        name: c.mealType === "desayuno" ? "Desayuno" : c.mealType === "almuerzo" ? "Almuerzo" : "Cena",
        time: c.time,
        status: c.status === "confirmado" ? "signed" : "missed",
        // Mock cost if using balance
        cost: c.mealType === "desayuno" ? 15.00 : c.mealType === "almuerzo" ? 25.00 : 20.00
      }))
    }
  });

  const totalAsistencias = consumptions.filter(c => c.status === "confirmado").length;
  const asistenciasMensualesGoal = 60; // Hardcoded goal for now
  const percentComplete = Math.min((totalAsistencias / asistenciasMensualesGoal) * 100, 100);
  
  const diasRestantes = profile?.endDate 
    ? Math.max(0, Math.ceil((new Date(profile.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Secuencia de Hoy (simplificada)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayConsumptions = historyMap[todayStr] || [];
  
  const hasDesayuno = todayConsumptions.some(c => c.mealType === "desayuno" && c.status === "confirmado");
  const hasAlmuerzo = todayConsumptions.some(c => c.mealType === "almuerzo" && c.status === "confirmado");
  const hasCena = todayConsumptions.some(c => c.mealType === "cena" && c.status === "confirmado");

  const todayMeals = [
    { id: "desayuno", label: "Desayuno", icon: Coffee, timeStr: "07:00 AM - 10:00 AM", status: hasDesayuno ? "signed" : "pending" },
    { id: "almuerzo", label: "Almuerzo", icon: Utensils, timeStr: "12:00 PM - 03:00 PM", status: hasAlmuerzo ? "signed" : "pending" },
    { id: "cena", label: "Cena", icon: MoonStar, timeStr: "07:00 PM - 10:00 PM", status: hasCena ? "signed" : "locked" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-32">
      {/* ─── Elite Header ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-900 pt-16 px-6 pb-12 rounded-b-[3.5rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-[100px] -mr-40 -mt-20" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-[80px]" />
        
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
             <div className="glass-premium rounded-3xl p-5 border-white/10 shadow-2xl bg-white/5 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl -mr-8 -mt-8" />
                <p className="text-emerald-400 text-2xl font-black font-display leading-none relative z-10">
                  S/ {user.balance ? user.balance.toFixed(2) : "150.00"}
                </p>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-2 relative z-10">Saldo Prepago</p>
             </div>
             <div className="glass-premium rounded-3xl p-5 border-white/10 shadow-2xl bg-white/5 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl -ml-8 -mt-8" />
                <p className="text-white text-2xl font-black font-display leading-none relative z-10">{diasRestantes}</p>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-2 relative z-10">Días Restantes</p>
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
                  {todayMeals.map((meal, idx) => (
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
                               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">CONFIRMADO</span>
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
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-display mb-6 ml-1">Historial de Consumos</h3>
               
               {historyData.length === 0 ? (
                 <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/10">
                   <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                   <h4 className="text-slate-500 dark:text-slate-400 font-bold font-display">No hay consumos registrados</h4>
                   <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Aparecerán aquí cuando escaneen tu QR</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {historyData.map((group, gi) => (
                      <div key={gi} className="p-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-3 ml-2">{group.date}</p>
                         <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-2 space-y-1">
                            {group.items.map(item => (
                              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-white/5 transition-transform hover:scale-[1.01] cursor-pointer shadow-sm">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                                      item.status === 'missed' ? 'bg-slate-100 dark:bg-slate-900/50 text-slate-400' : 
                                      item.name === 'Desayuno' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-500 border border-orange-100 dark:border-orange-500/20' :
                                      item.name === 'Almuerzo' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 border border-emerald-100 dark:border-emerald-500/20' :
                                      'bg-blue-50 dark:bg-blue-950/30 text-blue-500 border border-blue-100 dark:border-blue-500/20'
                                    }`}>
                                       {item.status === 'signed' ? (
                                          item.name === 'Desayuno' ? <Coffee className="w-6 h-6" /> :
                                          item.name === 'Almuerzo' ? <Utensils className="w-6 h-6" /> :
                                          <MoonStar className="w-6 h-6" />
                                       ) : <span className="text-xl font-bold opacity-30">!</span>}
                                    </div>
                                    <div>
                                      <h5 className={`font-black text-sm font-display tracking-tight leading-none mb-1 ${item.status === 'missed' ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                                         {item.name}
                                      </h5>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.status === 'missed' ? 'Anulado' : item.time}</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-end gap-1">
                                    {item.status === 'signed' ? (
                                      <>
                                        <span className="text-sm font-black text-slate-900 dark:text-white font-display">
                                          - S/ {item.cost.toFixed(2)}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Pagado</span>
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-sm font-black text-slate-300 dark:text-slate-600 font-display">
                                        S/ 0.00
                                      </span>
                                    )}
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   ))}
                 </div>
               )}
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
                     <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-primary to-cyan-600 p-0.5 shadow-2xl">
                        <div className="w-full h-full rounded-[30px] overflow-hidden bg-slate-900">
                           <img src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} className="w-full h-full object-cover" alt="" />
                        </div>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-xl rounded-2xl flex items-center justify-center border-4 border-white">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     </div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white font-display tracking-tight leading-none mb-2">{profile?.fullName || user.name}</h2>
                  <p className="text-[10px] font-black text-slate-400 capitalize bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full inline-block mb-8">
                     Miembro {profile?.planType || user.planType || 'Premium'}
                  </p>
                  
                  <div className="w-full space-y-4 pt-4 border-t border-slate-50 dark:border-white/5">
                     <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Identificación</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white font-display">{profile?.dni || user.dni || user.code}</span>
                     </div>
                     <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Antigüedad</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white font-display">{profile?.startDate || user.startDate ? new Date(profile?.startDate || user.startDate || '').toLocaleDateString() : 'N/A'}</span>
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
    </div>
  );
}
