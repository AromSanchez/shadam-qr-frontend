"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChefHat,
  Sparkles,
  Moon,
  Sun,
  UtensilsCrossed,
  X,
  Package,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────
interface BackendProduct {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: string;
  imagen?: string;
  categoria: "ENTRADA" | "MENU";
}

interface MenuProductRelation {
  id: string;
  menuId: string;
  productoId: number;
  visible: boolean;
  producto: BackendProduct;
}

interface ActiveMenu {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: string;
  productos: MenuProductRelation[];
}

// ─── Helpers ──────────────────────────────────────────
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function getTodayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

function formatPrice(precio: string | number) {
  const n = Number(precio);
  if (!n || n <= 0) return null;
  return `S/ ${n.toFixed(2)}`;
}

function getImageUrl(imagen?: string): string | null {
  if (!imagen) return null;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  if (imagen.startsWith("http")) {
    return imagen.replace("http://localhost:4000", baseUrl);
  }
  return `${baseUrl}${imagen}`;
}

// ─── Skeleton Card ────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-3xl bg-[var(--pos-card)] border border-[var(--pos-border)] overflow-hidden animate-pulse">
      <div className="h-44 bg-[var(--pos-surface-2)]" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-[var(--pos-surface-2)] rounded-xl w-3/4" />
        <div className="h-3 bg-[var(--pos-surface-2)] rounded-xl w-full" />
        <div className="h-3 bg-[var(--pos-surface-2)] rounded-xl w-2/3" />
      </div>
    </div>
  );
}

// ─── Detail Dialog ────────────────────────────────────
function ProductDialog({
  item,
  onClose,
}: {
  item: MenuProductRelation;
  onClose: () => void;
}) {
  const imgUrl = getImageUrl(item.producto.imagen);
  const price = formatPrice(item.producto.precio);
  const isEntrada = item.producto.categoria === "ENTRADA";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 sm:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Card */}
        <motion.div
          className="relative w-full max-w-md bg-[var(--pos-card)] border border-[var(--pos-border)] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl z-10"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
        >
          {/* Image */}
          <div className="relative w-full h-56 sm:h-64 bg-[var(--pos-surface-2)] flex items-center justify-center overflow-hidden">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={item.producto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--pos-text-muted)]">
                <Package size={48} strokeWidth={1.5} />
                <span className="text-xs">Sin imagen</span>
              </div>
            )}
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X size={18} />
            </button>
            {/* Category badge */}
            <span
              className={cn(
                "absolute bottom-4 left-4 text-[10px] font-bold uppercase px-3 py-1 rounded-full backdrop-blur-md",
                isEntrada
                  ? "bg-emerald-500/90 text-white"
                  : "bg-cyan-500/90 text-white"
              )}
            >
              {isEntrada ? "Entrada" : "Plato de Fondo"}
            </span>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-black text-[var(--pos-text)] leading-tight tracking-tight">
                {item.producto.nombre}
              </h2>
              {price ? (
                <span className="flex-shrink-0 font-mono font-extrabold text-xl text-[var(--pos-primary)]">
                  {price}
                </span>
              ) : (
                <span className="flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-[var(--pos-success-bg)] text-[var(--pos-success)] border border-[var(--pos-success-border)]">
                  Incluido
                </span>
              )}
            </div>

            {item.producto.descripcion && (
              <p className="text-[var(--pos-text-muted)] text-sm leading-relaxed">
                {item.producto.descripcion}
              </p>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[var(--pos-primary)] text-[var(--pos-primary-foreground)] font-bold text-sm tracking-wider hover:opacity-90 transition-opacity mt-2"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Product Card ─────────────────────────────────────
function ProductCard({
  item,
  index,
  onClick,
}: {
  item: MenuProductRelation;
  index: number;
  onClick: () => void;
}) {
  const imgUrl = getImageUrl(item.producto.imagen);
  const price = formatPrice(item.producto.precio);
  const isEntrada = item.producto.categoria === "ENTRADA";

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={onClick}
      className="group text-left w-full rounded-3xl bg-[var(--pos-card)] border border-[var(--pos-border)] hover:border-[var(--pos-primary)]/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pos-primary)]"
    >
      {/* Image */}
      <div className="relative w-full h-44 bg-[var(--pos-surface-2)] overflow-hidden flex items-center justify-center">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={item.producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--pos-text-muted)]">
            <Package size={36} strokeWidth={1.5} />
          </div>
        )}

        {/* Category badge */}
        <span
          className={cn(
            "absolute top-3 left-3 text-[9px] font-bold uppercase px-2.5 py-1 rounded-full backdrop-blur-sm",
            isEntrada
              ? "bg-[var(--pos-success)] text-[var(--pos-primary-foreground)]"
              : "bg-[var(--pos-primary)] text-[var(--pos-primary-foreground)]"
          )}
        >
          {isEntrada ? "Entrada" : "Plato de Fondo"}
        </span>
      </div>

      {/* Info */}
      <div className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-[var(--pos-text)] text-base leading-snug tracking-tight group-hover:text-[var(--pos-primary)] transition-colors line-clamp-2">
            {item.producto.nombre}
          </h3>
          {price ? (
            <span className="flex-shrink-0 font-mono font-bold text-sm text-[var(--pos-primary)]">
              {price}
            </span>
          ) : (
            <span className="flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--pos-success-bg)] text-[var(--pos-success)] border border-[var(--pos-success-border)]">
              INCLUIDO
            </span>
          )}
        </div>

        {item.producto.descripcion && (
          <p className="text-[var(--pos-text-muted)] text-xs leading-relaxed line-clamp-2">
            {item.producto.descripcion}
          </p>
        )}

        <div className="pt-1 flex items-center gap-1.5 text-[var(--pos-text-muted)]">
          <span className="text-[10px] font-semibold uppercase tracking-widest">Ver detalle →</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main Page ────────────────────────────────────────
export default function MenuLandingPage() {
  const [menu, setMenu] = useState<ActiveMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [noMenu, setNoMenu] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuProductRelation | null>(null);

  // Init dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
    setIsDark(true);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  // Fetch menu del día
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/menus/actual");
        if (res.status === 404) {
          setNoMenu(true);
          return;
        }
        if (!res.ok) {
          setNoMenu(true);
          return;
        }
        const data: ActiveMenu = await res.json();
        setMenu(data);
        setNoMenu(false);
      } catch {
        setNoMenu(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Separar visibles
  const entradas = menu?.productos.filter(
    (p) => p.visible && p.producto.categoria === "ENTRADA"
  ) ?? [];
  const fondos = menu?.productos.filter(
    (p) => p.visible && p.producto.categoria === "MENU"
  ) ?? [];

  const allVisible = [...entradas, ...fondos];

  return (
    <div className="min-h-screen bg-[var(--pos-bg)] transition-colors duration-500 pb-16 relative overflow-x-hidden">
      {/* ─── Background Glows ─── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[var(--pos-primary-dim)] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[var(--pos-primary-dim)] rounded-full blur-[120px] pointer-events-none" />

      {/* ─── Header ─── */}
      <div className="relative pt-12 px-5 sm:px-8 pb-6 z-10 max-w-2xl mx-auto">
        <div className="flex justify-end">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-[var(--pos-surface)] border border-[var(--pos-border)] shadow-sm text-[var(--pos-text)] hover:scale-105 transition-all"
            title="Cambiar tema"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 text-center"
        >
          {/* Brand badge */}
          <div className="inline-flex items-center gap-2 border border-[var(--pos-primary-dim)] bg-[var(--pos-primary-dim)] px-4 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3 h-3 text-[var(--pos-primary)]" />
            <span className="text-[var(--pos-primary)] text-xs font-bold tracking-[0.2em] uppercase">
              Restaurante Shadam
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight text-[var(--pos-text)]">
            Menú del Día
          </h1>
          <p className="text-[var(--pos-text-muted)] text-sm font-light max-w-xs mx-auto">
            Platos frescos preparados hoy para ti.
          </p>

          {/* Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <div className="flex items-center gap-2 text-[var(--pos-text-2)] bg-[var(--pos-surface)] px-4 py-2 rounded-2xl border border-[var(--pos-border)] shadow-sm">
              <CalendarDays className="w-4 h-4 text-[var(--pos-success)]" />
              <span className="text-xs font-medium tracking-wide">{getTodayLabel()}</span>
            </div>
            {menu && (
              <div className="flex items-center gap-2 text-[var(--pos-text-2)] bg-[var(--pos-surface)] px-4 py-2 rounded-2xl border border-[var(--pos-border)] shadow-sm">
                <ChefHat className="w-4 h-4 text-[var(--pos-primary)]" />
                <span className="text-xs font-medium tracking-wide truncate max-w-[180px]">
                  {menu.nombre}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="px-5 sm:px-8 max-w-2xl mx-auto relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : noMenu || allVisible.length === 0 ? (
          /* ── No menu state ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--pos-surface)] border border-[var(--pos-border)] flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-[var(--pos-warning)]" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-lg text-[var(--pos-text)]">
                Menú no disponible
              </h2>
              <p className="text-sm text-[var(--pos-text-muted)] max-w-xs">
                El menú de hoy aún no ha sido publicado. Vuelve más tarde.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* ENTRADAS */}
            {entradas.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--pos-success-bg)] flex items-center justify-center">
                    <Tag className="w-3.5 h-3.5 text-[var(--pos-success)]" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--pos-success)]">
                    Entradas
                  </h2>
                  <div className="flex-1 h-px bg-[var(--pos-success-bg)]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AnimatePresence>
                    {entradas.map((item, i) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        index={i}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* PLATOS DE FONDO */}
            {fondos.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--pos-primary-dim)] flex items-center justify-center">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--pos-primary)]" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--pos-primary)]">
                    Platos de Fondo
                  </h2>
                  <div className="flex-1 h-px bg-[var(--pos-primary-dim)]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AnimatePresence>
                    {fondos.map((item, i) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        index={i}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* ─── Detail Dialog ─── */}
      {selectedItem && (
        <ProductDialog
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
