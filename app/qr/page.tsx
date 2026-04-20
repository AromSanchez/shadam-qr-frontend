"use client";

import { useState, useEffect } from "react";
import { Clock, ShieldCheck, QrCode, Coffee, Utensils, MoonStar, Zap, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/ui/bottom-nav";
import { HeaderProfile } from "@/components/ui/header-profile";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

function getCurrentMealTurn() {
  const hour = new Date().getHours();
  if (hour < 11) return { id: "desayuno", label: "Desayuno", icon: Coffee, time: "7:00 AM - 10:00 AM", color: "text-amber-500", bg: "bg-amber-50" };
  if (hour < 17) return { id: "almuerzo", label: "Almuerzo", icon: Utensils, time: "12:00 PM - 3:00 PM", color: "text-emerald-500", bg: "bg-emerald-50" };
  return { id: "cena", label: "Cena", icon: MoonStar, time: "7:00 PM - 10:00 PM", color: "text-indigo-500", bg: "bg-indigo-50" };
}

export default function QRIdentityPage() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(45);
  const [currentTurn, setCurrentTurn] = useState(() => getCurrentMealTurn());
  
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 45;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    const turnInterval = setInterval(() => setCurrentTurn(getCurrentMealTurn()), 60000);
    return () => clearInterval(turnInterval);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pb-24 flex flex-col items-center">
        <div className="w-full p-6 pb-2 bg-slate-900 rounded-b-[3rem]">
          <HeaderProfile />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-10">
          <div className="text-center p-10 rounded-[3rem] glass-premium shadow-elite border border-slate-100">
            <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-800 mb-2 font-display">Identidad Protegida</h2>
            <p className="text-slate-400 text-sm leading-relaxed">Por favor, valida tu identidad para generar tu pasaporte dinámico de comedor.</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const TurnIcon = currentTurn.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             opacity: [0.3, 0.5, 0.3],
             rotate: [0, 90, 0]
           }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute -top-[10%] -right-[10%] w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full"
         />
         <div className="absolute top-[40%] -left-[10%] w-[50%] h-[30%] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="w-full p-6 pb-2 z-10 relative bg-slate-900 rounded-b-[3rem] shadow-xl">
        <HeaderProfile />
        <div className="mt-8 mb-4">
           <h1 className="text-white text-3xl font-black font-display tracking-tight">Mi Pasaporte</h1>
           <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Ecosistema QR v2.0</p>
        </div>
      </div>

      <div className="w-full max-w-md px-6 flex-1 flex flex-col mt-8 z-10 relative">
        
        {/* Turn Card - Ticket Style */}
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="relative mb-10"
        >
           {/* Perforated Edge Visual */}
           <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-50 dark:bg-slate-950 rounded-full z-10" />
           <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-50 dark:bg-slate-950 rounded-full z-10" />
           
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-elite border border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentTurn.bg} dark:bg-slate-800 ${currentTurn.color} shadow-inner`}>
                    <TurnIcon className="w-7 h-7" strokeWidth={2.5} />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white font-display leading-tight">{currentTurn.label}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{currentTurn.time}</p>
                 </div>
              </div>
              <div className="text-right">
                 <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black tracking-tighter animate-pulse mb-1">TURNO ACTIVO</Badge>
                 <div className="flex items-center gap-1 justify-end">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Tiempo</span>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Main QR Container */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-primary/10 border border-slate-100 dark:border-white/10 mb-8 mx-auto w-full flex flex-col items-center relative group"
        >
          {/* Inner Glow Surround */}
          <div className="absolute inset-0 bg-primary/5 rounded-[3rem] pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />

          {/* QR Area */}
          <div className="relative w-full aspect-square bg-white rounded-[2rem] flex items-center justify-center shadow-inner border-[10px] border-slate-50 dark:border-slate-800/50 overflow-hidden">
            <QrCode strokeWidth={1} className="w-full h-full text-slate-900 p-6 transition-transform group-hover:scale-[1.03] duration-500" />
            
            {/* Elite Corner Markers */}
            <div className="absolute top-4 left-4 w-10 h-10 border-t-8 border-l-8 border-primary rounded-tl-2xl shadow-[0_0_20px_rgba(242,101,34,0.3)]"></div>
            <div className="absolute top-4 right-4 w-10 h-10 border-t-8 border-r-8 border-primary rounded-tr-2xl shadow-[0_0_20px_rgba(242,101,34,0.3)]"></div>
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-8 border-l-8 border-primary rounded-bl-2xl shadow-[0_0_20px_rgba(242,101,34,0.3)]"></div>
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-8 border-r-8 border-primary rounded-br-2xl shadow-[0_0_20px_rgba(242,101,34,0.3)]"></div>

            {/* Premium Scanning Laser */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-2 bg-primary shadow-[0_0_30px_rgba(242,101,34,1)] z-10"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
            />
          </div>

          {/* Refresh Timer Progress Bar */}
          <div className="mt-10 w-full">
             <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Token Dinámico</span>
                <span className="text-[10px] font-black text-primary font-display tabular-nums">0:{timeLeft.toString().padStart(2, '0')}</span>
             </div>
             <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <motion.div 
                   initial={{ width: "100%" }}
                   animate={{ width: `${(timeLeft / 45) * 100}%` }}
                   className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(242,101,34,0.5)]"
                />
             </div>
          </div>
        </motion.div>

        {/* User Card */}
        <div className="glass-premium rounded-[2.5rem] p-6 border border-white/50 shadow-elite flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-0.5 shadow-xl">
                   <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-800">
                      <Image src={user.avatar} alt="Avatar" width={56} height={56} className="object-cover" />
                   </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                   <ShieldCheck className="w-3 h-3 text-white" />
                </div>
             </div>
             <div>
               <h3 className="text-base font-black text-slate-800 dark:text-white font-display tracking-tight leading-none mb-1">{user.name}</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: 109.XXX.XXX</p>
             </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-white/5">
             <Info className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] font-display">
          Seguridad Biométrica Activa
        </p>

      </div>
      
      <BottomNav />
    </div>
  );
}
