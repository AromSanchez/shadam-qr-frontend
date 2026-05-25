"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Calendar,
  UtensilsCrossed,
  Layers,
  History,
  CheckCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface Menu {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  productos?: MenuProductRelation[];
}

export default function MenuDelDiaPage() {
  const [activeTab, setActiveTab] = useState<"activo" | "historial">("activo");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [availableProducts, setAvailableProducts] = useState<BackendProduct[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [newMenuName, setNewMenuName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Cargar historial, menú activo y productos disponibles
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // 1. Historial
      const hRes = await fetch("/api/menus");
      if (hRes.ok) {
        const hData = await hRes.json();
        setMenus(hData);
        // El menú activo es el que tiene activo === true en la lista
        const active = hData.find((m: Menu) => m.activo);
        setCurrentMenu(active || null);
      }

      // 2. Productos
      const pRes = await fetch("/api/products");
      if (pRes.ok) {
        const pData = await pRes.json();
        // Mapear campos devueltos por el proxy de productos a la interfaz local
        const mapped: BackendProduct[] = pData.map((p: any) => ({
          id: Number(p.id),
          nombre: p.name,
          descripcion: p.description,
          precio: String(p.price),
          imagen: p.image,
          categoria: p.categoryId?.toUpperCase() === "ENTRADA" ? "ENTRADA" : "MENU",
        }));
        setAvailableProducts(mapped);
      }
    } catch {
      toast.error("Error al conectar con la API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Crear un nuevo menú del día (desactiva anteriores)
  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) {
      toast.error("El nombre del menú es requerido");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newMenuName.trim() }),
      });

      if (res.ok) {
        toast.success("¡Menú creado correctamente!");
        setNewMenuName("");
        setIsCreateOpen(false);
        await fetchAllData();
      } else {
        toast.error("Error al crear el menú");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setActionLoading(false);
    }
  };

  // Alternar estado activo del menú
  const handleToggleMenu = async (menuId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/menus/${menuId}/toggle`, {
        method: "PATCH",
      });

      if (res.ok) {
        toast.success("Estado del menú actualizado");
        await fetchAllData();
      } else {
        toast.error("Error al actualizar estado del menú");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setActionLoading(false);
    }
  };

  // Agregar producto al menú actual
  const handleAddProductToMenu = async (productoId: number) => {
    if (!currentMenu) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/menus/${currentMenu.id}/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoId }),
      });

      if (res.ok) {
        toast.success("Producto agregado al menú");
        await fetchAllData();
      } else if (res.status === 409) {
        toast.warning("Este plato ya ha sido agregado al menú de hoy");
      } else {
        toast.error("Error al agregar producto");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setActionLoading(false);
    }
  };

  // Alternar visibilidad del producto
  const handleToggleProductVisibility = async (productoId: number) => {
    if (!currentMenu) return;

    try {
      const res = await fetch(`/api/menus/${currentMenu.id}/productos/${productoId}/toggle`, {
        method: "PATCH",
      });

      if (res.ok) {
        await fetchAllData();
      } else {
        toast.error("Error al alternar visibilidad");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  // Filtrar productos disponibles que aún no están en el menú actual
  const filteredAvailableProducts = useMemo(() => {
    if (!availableProducts) return [];
    
    // Obtener ids de productos ya agregados
    const addedIds = currentMenu?.productos?.map(p => p.productoId) || [];
    
    return availableProducts.filter(p => {
      const isNotAdded = !addedIds.includes(p.id);
      const matchesSearch = p.nombre.toLowerCase().includes(productSearch.toLowerCase()) || 
                            (p.descripcion && p.descripcion.toLowerCase().includes(productSearch.toLowerCase()));
      return isNotAdded && matchesSearch;
    });
  }, [availableProducts, currentMenu, productSearch]);

  // Agrupar los productos del menú actual por categoría (Entrada vs Fondo)
  const currentMenuCategorized = useMemo(() => {
    if (!currentMenu || !currentMenu.productos) return { entradas: [], fondos: [] };

    const items = currentMenu.productos;
    const entradas = items.filter(item => item.producto.categoria === "ENTRADA");
    const fondos = items.filter(item => item.producto.categoria === "MENU");

    return { entradas, fondos };
  }, [currentMenu]);

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <UtensilsCrossed className="text-primary" size={22} />
                <h1 className="text-2xl font-bold text-foreground">Planificador de Menús</h1>
              </div>
              <p className="text-sm text-muted-foreground pl-8">Elige los platos del menú diario e interactúa con el historial</p>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground">
                    <Plus size={16} /> Crear Menú del Día
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-primary">Nuevo Menú Diario</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateMenu} className="space-y-4 pt-2">
                    <p className="text-xs text-muted-foreground">
                      Nota: Al crear y activar este menú, cualquier menú anterior será desactivado automáticamente.
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Nombre del menú</label>
                      <Input
                        placeholder="Ej. Menú Lunes 26 Mayo"
                        value={newMenuName}
                        onChange={e => setNewMenuName(e.target.value)}
                        className="focus-visible:ring-primary/50"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {actionLoading ? "Creando..." : "Crear y Activar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* TABS NAVEGACIÓN */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("activo")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all focus:outline-none",
                activeTab === "activo"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar size={16} /> Menú del Día Activo
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all focus:outline-none",
                activeTab === "historial"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <History size={16} /> Historial de Menús
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Cargando información del menú...
            </div>
          ) : activeTab === "activo" ? (
            /* ======================================================== */
            /* TAB: MENÚ ACTIVO                                         */
            /* ======================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LISTA DEL MENU ACTUAL */}
              <div className="lg:col-span-2 space-y-6">
                {!currentMenu ? (
                  <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-foreground">No hay menú activo actualmente</h3>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Crea un menú diario para hoy y añade los platos correspondientes para que los clientes puedan verlos.
                      </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Crear Menú Ahora
                    </Button>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Nombre menú del día */}
                    <div className="p-5 bg-muted/40 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="text-primary" size={18} />
                        <div>
                          <h2 className="font-bold text-foreground">{currentMenu.nombre}</h2>
                          <p className="text-[10px] text-muted-foreground">Creado el {new Date(currentMenu.createdAt).toLocaleDateString("es-ES")}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                        Activo
                      </span>
                    </div>

                    {/* Contenido categorizado */}
                    <div className="p-5 space-y-6">
                      
                      {/* CATEGORÍA ENTRADAS */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border pb-1.5">
                          <Layers size={12} /> Entradas del Día
                        </h3>
                        {currentMenuCategorized.entradas.length === 0 ? (
                          <p className="text-xs italic text-muted-foreground py-2">No se han añadido entradas todavía.</p>
                        ) : (
                          <div className="divide-y divide-border/60">
                            {currentMenuCategorized.entradas.map((item) => (
                              <div key={item.id} className="flex items-center justify-between py-3">
                                <div>
                                  <h4 className="text-sm font-bold text-foreground">{item.producto.nombre}</h4>
                                  {item.producto.descripcion && <p className="text-xs text-muted-foreground mt-0.5">{item.producto.descripcion}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleProductVisibility(item.productoId)}
                                    title={item.visible ? "Ocultar plato al cliente" : "Mostrar plato al cliente"}
                                    className={cn(
                                      "p-1.5 rounded-lg border transition-all",
                                      item.visible
                                        ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                                        : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                                    )}
                                  >
                                    {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CATEGORÍA PLATOS DE FONDO / MENUS */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border pb-1.5">
                          <UtensilsCrossed size={12} /> Platos de Fondo
                        </h3>
                        {currentMenuCategorized.fondos.length === 0 ? (
                          <p className="text-xs italic text-muted-foreground py-2">No se han añadido platos de fondo todavía.</p>
                        ) : (
                          <div className="divide-y divide-border/60">
                            {currentMenuCategorized.fondos.map((item) => (
                              <div key={item.id} className="flex items-center justify-between py-3">
                                <div>
                                  <h4 className="text-sm font-bold text-foreground">{item.producto.nombre}</h4>
                                  {item.producto.descripcion && <p className="text-xs text-muted-foreground mt-0.5">{item.producto.descripcion}</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-mono text-sm font-semibold text-foreground">
                                    {Number(item.producto.precio) > 0 ? `S/ ${Number(item.producto.precio).toFixed(2)}` : "-"}
                                  </span>
                                  <button
                                    onClick={() => handleToggleProductVisibility(item.productoId)}
                                    title={item.visible ? "Ocultar plato al cliente" : "Mostrar plato al cliente"}
                                    className={cn(
                                      "p-1.5 rounded-lg border transition-all",
                                      item.visible
                                        ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                                        : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                                    )}
                                  >
                                    {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTOR BUSCADOR Y AGREGAR PLATOS */}
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Agregar platos al Menú</h3>
                    <p className="text-[11px] text-muted-foreground">Busca y selecciona platos para integrarlos al menú activo</p>
                  </div>

                  {/* Buscador */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <Input
                      placeholder="Buscar platos..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="pl-9 h-9 text-xs focus-visible:ring-primary/50"
                      disabled={!currentMenu}
                    />
                  </div>

                  {/* Lista de productos para agregar */}
                  <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
                    {!currentMenu ? (
                      <p className="text-xs text-muted-foreground italic text-center py-6">Primero debes crear o activar un menú diario.</p>
                    ) : filteredAvailableProducts.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-6">No hay platos disponibles.</p>
                    ) : (
                      filteredAvailableProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2.5 bg-muted/30 border border-border/80 rounded-xl hover:bg-muted/65 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{p.nombre}</p>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block",
                              p.categoria === "ENTRADA" 
                                ? "bg-emerald-500/10 text-emerald-500" 
                                : "bg-primary/10 text-primary"
                            )}>
                              {p.categoria === "ENTRADA" ? "Entrada" : `Menú S/ ${Number(p.precio).toFixed(2)}`}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddProductToMenu(p.id)}
                            className="h-7 px-2.5 text-[10px] bg-primary hover:bg-primary/95 text-primary-foreground"
                          >
                            Añadir
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* TAB: HISTORIAL DE MENÚS                                 */
            /* ======================================================== */
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Historial Completo
                </span>
              </div>
              <div className="divide-y divide-border">
                {menus.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No hay menús registrados en el historial.</p>
                ) : (
                  menus.map((m) => (
                    <div key={m.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-foreground text-base">{m.nombre}</h3>
                          {m.activo ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              ACTIVO
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground">
                              INACTIVO
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          <span>Creado: {new Date(m.createdAt).toLocaleDateString("es-ES")}</span>
                          <span>Platos asociados: {m.productos?.length || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {m.activo ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleMenu(m.id)}
                            className="text-amber-500 border-amber-500/30 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/20 text-xs font-semibold"
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleMenu(m.id)}
                            className="text-primary border-primary/30 hover:bg-primary/10 text-xs font-semibold"
                          >
                            Activar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}