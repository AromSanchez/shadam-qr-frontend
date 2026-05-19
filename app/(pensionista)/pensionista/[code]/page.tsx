"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QrCode, User, Calendar, CreditCard, Clock, Utensils, ShieldCheck, History } from "lucide-react";
import { motion } from "framer-motion";

interface Consumption {
  id: string;
  mealType: string;
  date: string;
  time: string;
}

interface Pensionist {
  id: string;
  fullName: string;
  code: string;
  dni: string;
  planType: string;
  startDate: string;
  endDate: string;
  breakfastCredits: number;
  lunchCredits: number;
  dinnerCredits: number;
  status: string;
  consumptions: Consumption[];
}

export default function PensionistProfilePage() {
  const params = useParams();
  const code = params.code as string;
  
  const [data, setData] = useState<Pensionist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Reuse validation endpoint to get current status
        const res = await fetch("/api/pensionists/validate-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode: code })
        });
        
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Código no encontrado");
        } else {
          const pensionist = await res.json();
          setData(pensionist);
        }
      } catch (e) {
        setError("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    if (code) fetchData();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
          <QrCode size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Código Inválido</h1>
        <p className="text-slate-500 max-w-xs">{error || "El código de pensionista no existe o ha sido desactivado."}</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="mt-6 px-6 py-3 bg-[#06b6d4] text-white rounded-2xl font-bold shadow-lg"
        >
          Volver al Menú
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-white p-6 pb-20 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-500">
            <ShieldCheck size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Carnet Digital</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${data.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-red-500'}`}>
            {data.status === 'active' ? 'Vigente' : 'Inactivo'}
          </div>
        </div>

        {/* QR CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-8 text-slate-900 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16" />
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-48 h-48 bg-slate-50 border-4 border-slate-100 rounded-3xl flex items-center justify-center p-4 relative">
               <QrCode size={120} className="text-[#06b6d4]" />
               <div className="absolute -bottom-3 bg-[#06b6d4] text-white px-4 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest">
                 {data.code}
               </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-black tracking-tight">{data.fullName}</h2>
              <p className="text-slate-400 text-sm font-medium">DNI: {data.dni}</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Plan</p>
               <p className="font-bold text-slate-700 capitalize">{data.planType}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Vencimiento</p>
               <p className="font-bold text-slate-700">{new Date(data.endDate).toLocaleDateString()}</p>
             </div>
          </div>
        </motion.div>

        {/* CREDITS SECTION */}
        <div className="space-y-4">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 px-2">
             <CreditCard size={14} /> Cupos Disponibles
           </h3>
           
           <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Desayuno', val: data.breakfastCredits, icon: '☕', color: 'bg-amber-500/10 border-amber-500/30 text-amber-500' },
                { label: 'Almuerzo', val: data.lunchCredits, icon: '🍛', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' },
                { label: 'Cena', val: data.dinnerCredits, icon: '🍲', color: 'bg-blue-500/10 border-blue-500/30 text-blue-500' },
              ].map((c) => (
                <div key={c.label} className={`flex flex-col items-center p-4 rounded-3xl border ${c.color} backdrop-blur-sm`}>
                   <span className="text-2xl mb-1">{c.icon}</span>
                   <span className="text-xl font-black font-mono">{c.val}</span>
                   <span className="text-[8px] uppercase font-bold tracking-widest opacity-60">{c.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* RECENT HISTORY */}
        <div className="space-y-4">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 px-2">
             <History size={14} /> Consumos Recientes
           </h3>
           
           <div className="space-y-2">
              {data.consumptions?.length > 0 ? (
                data.consumptions.slice(0, 3).map((c, i) => (
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
                       <p className="text-xs font-mono text-emerald-400 font-bold">REGISTRADO</p>
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
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-center">
           <p className="text-amber-200/70 text-xs font-medium leading-relaxed">
             Presenta este código QR en la recepción para validar tu comida del día. 
             ¡Buen provecho!
           </p>
        </div>

      </div>
    </div>
  );
}
