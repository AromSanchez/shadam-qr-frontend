"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Clock, CalendarDays, ChefHat, Sparkles, Moon, Sun, ShoppingBag, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/ui/bottom-nav";
import { HeaderProfile } from "@/components/ui/header-profile";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { useCart } from "@/lib/cart-context";
import { Product, Category } from "@/lib/mock-db";

// ─── Helpers ───────────────────────────────────────────
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function getTodayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function TableMenuPage() {
  const params = useParams();
  const tableId = params.tableId as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { addToCart, itemCount, total, setTableId } = useCart();

  // Initialize table context
  useEffect(() => {
    if (tableId) {
      setTableId(tableId);
    }
  }, [tableId, setTableId]);

  // Initialize theme
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') || true;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products")
        ]);
        
        const cats = await catsRes.json();
        const prods = await prodsRes.json();
        
        setCategories(cats);
        setProducts(prods);
      } catch (error) {
        console.error("Error loading menu", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "todos") return products.filter(p => p.available);
    return products.filter(p => p.categoryId === activeCategory);
  }, [activeCategory, products]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] transition-colors duration-500 pb-40 overflow-hidden relative">
      {/* ─── Premium Background Glows ─────────────────────────────────── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />

      {/* ─── Premium Header ─────────────────────────────────── */}
      <div className="relative pt-12 px-6 pb-6 z-10">
        <div className="flex justify-between items-center z-50 relative">
          <div className="flex items-center gap-3">
             <HeaderProfile />
             <div className="bg-[#aa4918] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
               Mesa {tableId.replace('table-', '')}
             </div>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm text-slate-700 dark:text-amber-400 hover:scale-105 transition-all"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-700 dark:text-amber-400/90 text-xs font-bold tracking-[0.2em] uppercase">
              Restaurante Shadam
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black mb-3 font-display tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-white/60 transition-colors duration-500">
            Menú Digital
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-light tracking-wide max-w-[280px] mx-auto transition-colors duration-500">
            Bienvenido. Escoge tus platos favoritos y ordena en segundos.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-8">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 px-3 sm:px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-all duration-500">
              <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] sm:text-xs font-medium tracking-wider">{getTodayLabel()}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 px-3 sm:px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-all duration-500">
              <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] sm:text-xs font-medium tracking-wider">Servicio en Mesa</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Clean Categories ──────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#060913]/80 backdrop-blur-xl py-4 border-b border-slate-200 dark:border-white/5 transition-colors duration-500">
        <div className="px-6 flex overflow-x-auto hide-scrollbar gap-3 justify-start sm:justify-center">
          <button
            onClick={() => setActiveCategory("todos")}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold tracking-widest transition-all flex items-center gap-2 ${
              activeCategory === "todos"
                ? "bg-amber-500 text-white dark:text-[#060913] shadow-[0_4px_14px_rgba(245,158,11,0.3)]"
                : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent"
            }`}
          >
            <span>✨</span>
            <span className="uppercase">General</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold tracking-widest transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-white dark:text-[#060913] shadow-[0_4px_14px_rgba(245,158,11,0.3)]"
                  : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent"
              }`}
            >
              <span className="uppercase">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Menu Items ─────────────────────────────── */}
      <main className="px-6 py-8 max-w-lg mx-auto relative z-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  key={product.id}
                  className="group relative p-6 rounded-[2rem] bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-white/[0.03] dark:to-transparent border border-slate-200 dark:border-white/[0.03] hover:border-amber-500/50 dark:hover:border-amber-500/20 shadow-sm dark:shadow-none transition-all duration-300"
                >
                  <div className="flex justify-between items-baseline mb-3 gap-4">
                     <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display tracking-wide transition-colors duration-500">
                       {product.name}
                     </h3>
                     <span className="text-amber-600 dark:text-amber-400 font-bold text-lg whitespace-nowrap">
                       S/ {product.price.toFixed(2)}
                     </span>
                  </div>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-light leading-relaxed mb-6 transition-colors duration-500">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4 transition-colors duration-500">
                     <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5">
                         <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                           {product.time || "15-20 min"}
                         </span>
                       </div>
                     </div>
                     
                     <button
                       onClick={() => addToCart(product)}
                       className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white dark:text-[#060913] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-md"
                     >
                       <Plus className="w-3.5 h-3.5" />
                       Añadir
                     </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Floating Cart Summary */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-0 right-0 z-40 px-6 flex justify-center pointer-events-none"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="pointer-events-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-full max-w-sm rounded-full p-1.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-transform"
            >
              <div className="bg-amber-500 text-white dark:text-[#060913] w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                {itemCount}
              </div>
              <div className="flex items-center gap-2 font-medium tracking-wide">
                <ShoppingBag className="w-4 h-4" />
                <span>Mi Pedido</span>
              </div>
              <div className="pr-4 font-bold">
                S/ {total.toFixed(2)}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <BottomNav />
    </div>
  );
}
