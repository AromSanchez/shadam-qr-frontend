"use client";

import { useState, useEffect } from "react";
import { QrCode, User, CreditCard, ShieldCheck, History, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { BottomNav } from "@/components/ui/bottom-nav";
import Link from "next/link";

interface Consumption {
  id: string;
  mealType: string;
  date: string;
  time: string;
}

interface PensionistData {
  id: string;
  fullName: string;
  code: string;
  dni: string;
  planType: string;
  startDate: string;
  endDate: string;
  breakfastCredits?: number;
  lunchCredits?: number;
  dinnerCredits?: number;
  status: string;
  consumptions: Consumption[];
}

export default function PensionistPortalPage() {
  const { user, login } = useAuth();
  
  // Login states
  const [inputCode, setInputCode] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard states (for fresh data)
  const [data, setData] = useState<PensionistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch fresh data if user is logged in
  useEffect(() => {
    const fetchFreshData = async () => {
      if (!user || user.role !== "pensionista" || !user.code) return;
      try {
        setLoading(true);
        const res = await fetch("/api/pensionists/validate-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode: user.code })
        });
        
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Error al obtener datos");
        } else {
          const pensionist = await res.json();
          setData(pensionist);
          // Sync state with auth context to keep credits up to date
          login({
            ...user,
            breakfastCredits: pensionist.breakfastCredits,
            lunchCredits: pensionist.lunchCredits,
            dinnerCredits: pensionist.dinnerCredits,
            status: pensionist.status
          });
        }
      } catch (e) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchFreshData();
  }, [user?.code]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    try {
      setLoginLoading(true);
      setLoginError(null);
      
        // Simulate login without backend validation
        const dummyPensionist = {
          fullName: "Demo Pensionista",
          code: inputCode.trim().toUpperCase(),
          dni: "00000000",
          planType: "Demo",
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          breakfastCredits: 10,
          lunchCredits: 10,
          dinnerCredits: 10,
          status: "activo",
          consumptions: []
        };
        setData(dummyPensionist);
        login({
          role: "pensionista",
          name: dummyPensionist.fullName,
          code: dummyPensionist.code,
          dni: dummyPensionist.dni,
          planType: dummyPensionist.planType,
          startDate: dummyPensionist.startDate,
          endDate: dummyPensionist.endDate,
          breakfastCredits: dummyPensionist.breakfastCredits,
          lunchCredits: dummyPensionist.lunchCredits,
          dinnerCredits: dummyPensionist.dinnerCredits,
          status: dummyPensionist.status,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
        });
        setLoginLoading(false);
      
    } catch (err) {
      setLoginError("Error de conexión con el servidor");
    } finally {
      setLoginLoading(false);
    }
  };

  // 1. NOT LOGGED IN - Show Login Screen
  if (!user || user.role !== "pensionista") {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Glow Effects */}
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />
        <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 rounded-full mb-6">
              <span className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase">
                Portal Pensionista
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">Bienvenido</h1>
            <p className="text-slate-400 text-sm">Ingresa tu código de pensionista para acceder a tu panel.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <QrCode className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Código (ej: PEN-0001)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-white placeholder-slate-500 uppercase font-mono tracking-widest"
                />
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs text-center font-bold">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="relative w-full h-14 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-2xl font-black tracking-wider transition-all disabled:opacity-80 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {loginLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Ingresar</span>
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

  // 2. LOADING STATE (while fetching fresh data)
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 3. LOGGED IN - Show Dashboard
  const dashboardData = data || {
    fullName: user.name,
    code: user.code || "",
    dni: user.dni || "",
    planType: user.planType || "cupos",
    endDate: user.endDate || new Date().toISOString(),
    status: user.status || "active",
    consumptions: []
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white p-6 pb-32 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-md mx-auto space-y-8 relative z-10">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Carnet Digital</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${dashboardData.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-red-500'}`}>
            {dashboardData.status === 'active' ? 'Vigente' : 'Inactivo'}
          </div>
        </div>

        {/* QR CARD */}
        <Link href="/pensionista/qr" className="block hover:scale-[1.01] active:scale-[0.99] transition-all">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 text-slate-900 shadow-2xl relative overflow-hidden cursor-pointer"
          >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 via-cyan-400/10 to-transparent -z-10" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl -z-10" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-48 h-48 bg-slate-50 border-4 border-slate-100 rounded-3xl flex items-center justify-center p-4 relative">
                 <QrCode size={120} className="text-cyan-500" />
                 <div className="absolute -bottom-3 bg-cyan-500 text-slate-950 px-4 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest shadow-md">
                   {dashboardData.code}
                 </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-black tracking-tight">{dashboardData.fullName}</h2>
                <p className="text-slate-400 text-sm font-medium">DNI: {dashboardData.dni}</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
               <div>
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Plan</p>
                 <p className="font-bold text-slate-700 capitalize">{dashboardData.planType}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Vencimiento</p>
                 <p className="font-bold text-slate-700">{new Date(dashboardData.endDate).toLocaleDateString()}</p>
               </div>
            </div>
          </motion.div>
        </Link>

        {/* CREDITS SECTION */}
        <div className="space-y-4">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 px-2">
             <CreditCard size={14} /> Cupos Disponibles
           </h3>
           
           <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Desayuno', val: user.breakfastCredits ?? 0, icon: '☕', color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
                { label: 'Almuerzo', val: user.lunchCredits ?? 0, icon: '🍛', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                { label: 'Cena', val: user.dinnerCredits ?? 0, icon: '🍲', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
              ].map((c) => (
                <div key={c.label} className={`flex flex-col items-center p-4 rounded-3xl border ${c.color} backdrop-blur-sm`}>
                   <span className="text-2xl mb-1">{c.icon}</span>
                   <span className="text-xl font-black font-mono">{c.val}</span>
                   <span className="text-cyan-600 dark:text-cyan-400 font-bold text-lg whitespace-nowrap">{c.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* RECENT HISTORY */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
               <History size={14} /> Consumos Recientes
             </h3>
             <Link href="/pensionista/historial" className="whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold tracking-widest transition-all flex items-center gap-2 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent">
               Ver Todo
             </Link>
           </div>
           
           <div className="space-y-2">
              {dashboardData.consumptions?.length > 0 ? (
                dashboardData.consumptions.slice(0, 3).map((c, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">
                          {c.mealType.toLowerCase().includes('des') ? '☕' : c.mealType.toLowerCase().includes('alm') ? '🍛' : '🍲'}
                       </div>
                       <div>
                          <p className="font-bold text-sm capitalize">{c.mealType}</p>
                          <p className="text-[10px] text-white/40">{c.date}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-mono text-cyan-400 font-bold">REGISTRADO</p>
                       <p className="text-[10px] text-white/30">{c.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-white/20 text-sm italic">No hay consumos registrados aún.</p>
              )}
           </div>
        </div>

        {/* FOOTER MESSAGE */}
        <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl text-center">
           <p className="text-cyan-200/70 text-xs font-medium leading-relaxed">
             Presenta este código QR en la recepción para validar tu comida del día. 
             ¡Buen provecho!
           </p>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
