"use client";

import { useState, useMemo } from "react";
import { Flame, Clock, Leaf, Sparkles, AlertCircle, ChefHat, Navigation, CalendarDays } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/ui/bottom-nav";
import { HeaderProfile } from "@/components/ui/header-profile";

// ─── Helpers ───────────────────────────────────────────
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function getTodayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// ─── Categories ────────────────────────────────────────
const CATEGORIES = [
  { id: "todos", label: "General", emoji: "🔥" },
  { id: "desayuno", label: "Desayuno", emoji: "☕" },
  { id: "almuerzo", label: "Almuerzo", emoji: "🍛" },
  { id: "cena", label: "Cena", emoji: "🍲" },
  { id: "extras", label: "Postres", emoji: "🍰" },
];

// ─── Menu Data ─────────────────────────────────────────
const MENU_ITEMS = [
  {
    id: 1,
    name: "Desayuno Andino",
    description: "Huevos revueltos, pan artesanal, jugo de naranja recién exprimido y café pasado.",
    category: "desayuno",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
    popular: true,
    stock: true,
    time: "7:00 AM - 10:00 AM",
    calories: "450 cal",
    tags: ["Nutritivo"],
  },
  {
    id: 3,
    name: "Ceviche de la Casa",
    description: "Pescado fresco marinado al limón con cebolla y ají, acompañado de canchita y camote.",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?q=80&w=600&auto=format&fit=crop",
    popular: true,
    stock: true,
    time: "12:00 PM - 3:00 PM",
    calories: "380 cal",
    tags: ["Chef's Selection"],
  },
  {
    id: 4,
    name: "Lomo Saltado Fino",
    description: "Trozos de lomo fino flambeados al wok con arroz blanco y papas fritas crocantes.",
    category: "almuerzo",
    image: "https://images.unsplash.com/photo-1512132411229-c30391241dd8?q=80&w=600&auto=format&fit=crop",
    popular: true,
    stock: true,
    time: "12:00 PM - 3:00 PM",
    calories: "650 cal",
    tags: ["Favorito"],
  },
  {
    id: 6,
    name: "Caldo de Gallina",
    description: "Reconfortante caldo tradicional con fideos, papa amarilla y huevo duro.",
    category: "cena",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=600&auto=format&fit=crop",
    popular: true,
    stock: true,
    time: "7:00 PM - 10:00 PM",
    tags: ["Energizante"],
  },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("todos");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "todos") return MENU_ITEMS.filter(p => p.stock);
    return MENU_ITEMS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-32">
      {/* ─── Elite Header ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-[360px] flex flex-col pt-14 px-6 pb-12 rounded-b-[3rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl -ml-24 -mb-24" />

        <div className="relative z-10">
          <HeaderProfile />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-[2px] bg-primary rounded-full" />
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] font-display">
                Gastronomía Selecta
              </p>
            </div>
            <h1 className="text-4xl font-black leading-tight font-display tracking-tight">
              Menú Oficial <br/> 
              <span className="text-primary italic font-medium">de Temporada</span>
            </h1>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10 shadow-lg">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold font-display uppercase tracking-wider">{getTodayLabel()}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10 shadow-lg">
                <ChefHat className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-display uppercase tracking-wider">Chef Master</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Highlights Section ──────────────────────────── */}
      <div className="px-6 -mt-10 relative z-20">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-white font-bold font-display flex items-center gap-2 text-sm uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-primary" /> Sugerencia VIP
          </h3>
        </div>
        <motion.div 
           whileHover={{ scale: 0.98 }}
           className="relative h-44 rounded-3xl overflow-hidden glass-premium shadow-elite border border-white/40 flex"
        >
          <div className="flex-1 p-6 flex flex-col justify-center">
             <Badge className="bg-primary/10 text-primary border-none w-fit mb-2 text-[10px]">RECOMENDACIÓN</Badge>
             <h4 className="text-xl font-black font-display text-slate-800 leading-tight">Ceviche de <br/> la Casa</h4>
             <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1 uppercase tracking-widest">
               <Clock className="w-3 h-3" /> Turno Almuerzo
             </p>
          </div>
          <div className="w-36 relative overflow-hidden rounded-l-[2rem]">
             <Image 
                src="https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?q=80&w=400" 
                alt="Ceviche" 
                fill 
                className="object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* ─── Categories ──────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl pt-8 pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="px-6 flex overflow-x-auto hide-scrollbar gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 font-display ${
                activeCategory === cat.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl scale-[1.05]"
                  : "bg-slate-50 dark:bg-slate-900 text-slate-400 hover:bg-slate-100 border border-slate-100 dark:border-white/5"
              }`}
            >
              <span className="text-sm">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Menu Items Grid ─────────────────────────────── */}
      <main className="px-6 py-8 max-w-lg mx-auto space-y-10">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
              key={product.id}
              className="group"
            >
              <div className="relative mb-6">
                 <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] transform translate-y-4 scale-[0.98] blur-sm opacity-50 group-hover:translate-y-6 transition-all duration-500" />
                 <div className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/10 glass-premium">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      priority={index < 2}
                      className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                       <div className="flex gap-2">
                          {product.popular && (
                            <Badge className="bg-primary/20 backdrop-blur-xl border border-primary/30 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 shadow-xl">
                              PREMIUM
                            </Badge>
                          )}
                          <Badge className="bg-black/30 backdrop-blur-xl border border-white/10 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 shadow-xl">
                            {product.calories || "500 CAL"}
                          </Badge>
                       </div>
                       <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-xl">
                          <Navigation className="w-4 h-4 text-white rotate-45" />
                       </div>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                       <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] font-display mb-1">
                         Turno {product.category}
                       </p>
                       <h3 className="text-2xl font-black text-white font-display tracking-tight mb-2">
                         {product.name}
                       </h3>
                       <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                         {product.description}
                       </p>
                       
                       <div className="mt-6 flex items-center gap-3">
                          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10">
                             <Clock className="w-3 h-3 text-primary" />
                             <span className="text-[10px] font-bold text-white uppercase tracking-wider">{product.time.split('-')[0].trim()}</span>
                          </div>
                          <div className="h-1 w-8 bg-white/10 rounded-full" />
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Disponible</div>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
