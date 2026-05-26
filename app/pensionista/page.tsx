"use client";

import { useState, useEffect } from "react";
import { QrCode, CreditCard, ShieldCheck, History } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  
  // Dashboard states
  const [data, setData] = useState<PensionistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in, otherwise fetch fresh data
  useEffect(() => {
    if (!user || user.role !== "pensionista") {
      router.replace("/pensionista/login");
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
  }, [user, router, login]);

  // If redirecting or fetching data, show loading spinner
  if (!user || user.role !== "pensionista" || loading) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Dashboard fallback data if fetch failed
  const dashboardData = data || {
    fullName: user.name,
    code: user.code || "",
    dni: user.dni || "",
    planType: user.planType || "cupos",
    endDate: user.endDate || new Date().toISOString(),
    status: user.status || "active",
    consumptions: [],
    breakfastCredits: user.breakfastCredits,
    lunchCredits: user.lunchCredits,
    dinnerCredits: user.dinnerCredits,
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white p-6 pb-32 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-md mx-auto space-y-8 relative z-10">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck size={24} />
            <span className="text-sm font-black uppercase tracking-widest">Carnet Digital</span>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${dashboardData.status === 'activo' || dashboardData.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-red-500 shadow-lg shadow-red-500/30'}`}>
            {dashboardData.status === 'activo' || dashboardData.status === 'active' ? 'Vigente' : 'Inactivo'}
          </div>
        </div>

        {/* QR CARD - Accessible and large */}
        <Link href="/pensionista/qr" className="block focus:outline-none focus:ring-4 focus:ring-cyan-500 rounded-[2.5rem] hover:scale-[1.01] active:scale-[0.99] transition-all">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 text-slate-900 shadow-2xl relative overflow-hidden cursor-pointer border-4 border-transparent hover:border-cyan-200 transition-colors"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-cyan-400/20 via-cyan-400/10 to-transparent -z-10" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-48 h-48 bg-slate-50 border-4 border-slate-100 rounded-3xl flex items-center justify-center p-4 relative shadow-inner">
                 <QrCode size={130} className="text-cyan-600" />
                 <div className="absolute -bottom-4 bg-cyan-500 text-slate-950 px-5 py-1.5 rounded-full text-xs font-mono font-black tracking-widest shadow-md border-2 border-white">
                   {dashboardData.code}
                 </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-800 leading-none mb-1">{dashboardData.fullName}</h2>
                <p className="text-slate-500 text-base font-bold">DNI: {dashboardData.dni}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-slate-100 grid grid-cols-2 gap-4">
               <div>
                 <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Plan</p>
                 <p className="font-black text-slate-700 text-lg capitalize">{dashboardData.planType}</p>
               </div>
               <div className="text-right">
                 <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Vencimiento</p>
                 <p className="font-black text-slate-700 text-lg">{new Date(dashboardData.endDate).toLocaleDateString()}</p>
               </div>
            </div>
            
            <div className="mt-6 flex justify-center">
               <span className="text-sm font-bold text-cyan-600 flex items-center gap-2">
                 Toque para ver QR grande <QrCode size={16} />
               </span>
            </div>
          </motion.div>
        </Link>

        {/* CREDITS SECTION */}
        <div className="space-y-4">
           <h3 className="text-base font-black uppercase tracking-[0.1em] text-slate-300 flex items-center gap-2 px-2">
             <CreditCard size={18} className="text-cyan-400" /> Cupos Disponibles
           </h3>
           
           <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Desayuno', val: dashboardData.breakfastCredits ?? 0, icon: '☕', color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
                { label: 'Almuerzo', val: dashboardData.lunchCredits ?? 0, icon: '🍛', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                { label: 'Cena', val: dashboardData.dinnerCredits ?? 0, icon: '🍲', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
              ].map((c) => (
                <div key={c.label} className={`flex flex-col items-center p-4 rounded-3xl border-2 ${c.color} backdrop-blur-sm shadow-lg`}>
                   <span className="text-3xl mb-2">{c.icon}</span>
                   <span className="text-2xl font-black font-mono leading-none">{c.val}</span>
                   <span className="font-bold text-sm mt-1 whitespace-nowrap opacity-90">{c.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* RECENT HISTORY */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
             <h3 className="text-base font-black uppercase tracking-[0.1em] text-slate-300 flex items-center gap-2">
               <History size={18} className="text-cyan-400" /> Últimos Consumos
             </h3>
             <Link href="/pensionista/consumo" className="px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95">
               Ver todos
             </Link>
           </div>
           
           <div className="space-y-3">
              {dashboardData.consumptions?.length > 0 ? (
                dashboardData.consumptions.slice(0, 3).map((c, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl border border-white/10">
                          {c.mealType.toLowerCase().includes('des') ? '☕' : c.mealType.toLowerCase().includes('alm') ? '🍛' : '🍲'}
                       </div>
                       <div>
                          <p className="font-black text-lg capitalize leading-none text-white">{c.mealType}</p>
                          <p className="text-sm text-slate-400 mt-1 font-medium">{c.date}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-mono text-cyan-400 font-bold uppercase tracking-wider">Validado</p>
                       <p className="text-sm text-slate-400 font-medium">{c.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <p className="text-slate-400 text-base font-medium">No hay consumos recientes.</p>
                </div>
              )}
           </div>
        </div>

        {/* FOOTER MESSAGE */}
        <div className="bg-cyan-500/10 border-2 border-cyan-500/30 p-5 rounded-2xl text-center">
           <p className="text-cyan-100 text-sm font-bold leading-relaxed">
             Presenta tu código QR en la recepción para registrar tu comida del día.
           </p>
        </div>

      </div>
    </div>
  );
}
