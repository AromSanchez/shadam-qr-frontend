"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Trash2, Eye, Save, Calendar, Copy, ArrowLeft,
  Search, BookOpen, UtensilsCrossed, Pencil, ChefHat,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { Label } from "@/components/ui/label";

type DishType = "entrada" | "segundo" | "postre" | "bebida";

interface Plato { id: string; nombre: string; descripcion: string; tipo: DishType; }
interface MenuItemRow { id: string; plato: Plato; precio: number; }
interface MenuDia { id: string; fecha: string; created_at: string; items: MenuItemRow[]; }

const DISH_CONFIG: Record<DishType, { label: string; pill: string; dot: string }> = {
  entrada: { label: "Entrada", pill: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  segundo: { label: "Segundo", pill: "bg-[#fdf0ea] text-[#aa4918] border border-orange-200", dot: "bg-[#aa4918]" },
  postre: { label: "Postre", pill: "bg-violet-50 text-violet-700 border border-violet-200", dot: "bg-violet-500" },
  bebida: { label: "Bebida", pill: "bg-sky-50 text-sky-700 border border-sky-200", dot: "bg-sky-500" },
};
const DISH_TYPES: DishType[] = ["entrada", "segundo", "postre", "bebida"];

const INITIAL_CATALOGO: Plato[] = [
  { id: "p1", nombre: "Sopa criolla", descripcion: "Sopa tradicional con fideos y huevo", tipo: "entrada" },
  { id: "p2", nombre: "Ensalada fresca", descripcion: "Lechuga, tomate, pepino", tipo: "entrada" },
  { id: "p3", nombre: "Papa a la huancaína", descripcion: "Con salsa de ají amarillo", tipo: "entrada" },
  { id: "p4", nombre: "Causa limeña", descripcion: "Papa amarilla rellena", tipo: "entrada" },
  { id: "p5", nombre: "Lomo saltado", descripcion: "Con arroz y papas fritas", tipo: "segundo" },
  { id: "p6", nombre: "Ají de gallina", descripcion: "Pollo deshilachado en crema de ají", tipo: "segundo" },
  { id: "p7", nombre: "Arroz con pollo", descripcion: "Arroz verde con presas de pollo", tipo: "segundo" },
  { id: "p8", nombre: "Seco de res", descripcion: "Guiso de res con frejoles", tipo: "segundo" },
  { id: "p9", nombre: "Pollo a la brasa", descripcion: "Con papas y ensalada", tipo: "segundo" },
  { id: "p10", nombre: "Arroz chaufa", descripcion: "Arroz frito estilo oriental", tipo: "segundo" },
  { id: "p11", nombre: "Mazamorra morada", descripcion: "Postre peruano clásico", tipo: "postre" },
  { id: "p12", nombre: "Arroz con leche", descripcion: "Arroz dulce con canela", tipo: "postre" },
  { id: "p13", nombre: "Chicha morada", descripcion: "Bebida de maíz morado", tipo: "bebida" },
  { id: "p14", nombre: "Limonada", descripcion: "Jugo de limón natural", tipo: "bebida" },
];

const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);
const formatDate = (d: string) => { const [y, m, day] = d.split("-"); return `${day}/${m}/${y}`; };

const buildMockHistory = (catalogo: Plato[]): MenuDia[] => {
  const find = (id: string) => catalogo.find((p) => p.id === id)!;
  const makeItems = (ids: string[], prices: number[]): MenuItemRow[] =>
    ids.map((id, i) => ({ id: uid(), plato: find(id), precio: prices[i] }));
  return [
    { id: uid(), fecha: "2026-04-12", created_at: "2026-04-12T08:00:00Z", items: makeItems(["p1", "p3", "p5", "p6", "p11", "p13"], [5, 6, 15, 14, 4, 3]) },
    { id: uid(), fecha: "2026-04-11", created_at: "2026-04-11T07:30:00Z", items: makeItems(["p2", "p4", "p7", "p10", "p12", "p14"], [5, 7, 13, 12, 4, 3]) },
    { id: uid(), fecha: "2026-04-10", created_at: "2026-04-10T08:15:00Z", items: makeItems(["p1", "p8", "p9", "p11", "p13"], [5, 14, 16, 4, 3]) },
  ];
};

const groupByType = (items: MenuItemRow[]) => {
  const g: Record<DishType, MenuItemRow[]> = { entrada: [], segundo: [], postre: [], bebida: [] };
  items.forEach((it) => g[it.plato.tipo].push(it));
  return g;
};

// Agrupa items por tipo y luego por precio
const groupByTypeAndPrice = (items: MenuItemRow[]) => {
  const byType = groupByType(items);
  const result: Record<DishType, { precio: number; items: MenuItemRow[] }[]> = {
    entrada: [], segundo: [], postre: [], bebida: [],
  };
  for (const type of DISH_TYPES) {
    const priceMap = new Map<number, MenuItemRow[]>();
    for (const it of byType[type]) {
      if (!priceMap.has(it.precio)) priceMap.set(it.precio, []);
      priceMap.get(it.precio)!.push(it);
    }
    result[type] = Array.from(priceMap.entries()).map(([precio, items]) => ({ precio, items }));
  }
  return result;
};

function Pill({ type, count }: { type: DishType; count?: number }) {
  const cfg = DISH_CONFIG[type];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}{count !== undefined ? ` (${count})` : ""}
    </span>
  );
}

export default function MenuDelDia() {
  const [catalogo, setCatalogo] = useState<Plato[]>(INITIAL_CATALOGO);
  const [history, setHistory] = useState<MenuDia[]>(() => buildMockHistory(INITIAL_CATALOGO));
  const [todayMenu, setTodayMenu] = useState<MenuDia | null>(null);
  const [viewingMenu, setViewingMenu] = useState<MenuDia | null>(null);
  const [editingMenu, setEditingMenu] = useState<MenuDia | null>(null);

  // Add-by-group dialog
  const [addGroupType, setAddGroupType] = useState<DishType | null>(null);
  const [groupPrecio, setGroupPrecio] = useState("");
  const [groupSelectedIds, setGroupSelectedIds] = useState<string[]>([]);
  const [searchPlato, setSearchPlato] = useState("");

  // Edit price dialog — para editar precio de un sub-grupo específico
  const [editingPriceGroup, setEditingPriceGroup] = useState<{ type: DishType; oldPrecio: number } | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");

  // Create/edit plato dialog
  const [showCreatePlato, setShowCreatePlato] = useState(false);
  const [newPlatoNombre, setNewPlatoNombre] = useState("");
  const [newPlatoDesc, setNewPlatoDesc] = useState("");
  const [newPlatoTipo, setNewPlatoTipo] = useState<DishType>("segundo");
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null);

  const createTodayMenu = () => {
    const menu: MenuDia = { id: uid(), fecha: today(), created_at: new Date().toISOString(), items: [] };
    setTodayMenu(menu); setEditingMenu(menu);
    toast.success("Menú de hoy creado. Agrega platos para completarlo.");
  };

  const duplicateFromPrevious = () => {
    const last = history[0]; if (!last) return;
    const menu: MenuDia = { id: uid(), fecha: today(), created_at: new Date().toISOString(), items: last.items.map((it) => ({ ...it, id: uid() })) };
    setTodayMenu(menu); setEditingMenu(menu);
    toast.success(`Menú duplicado desde ${formatDate(last.fecha)}`);
  };

  const openAddGroup = (type: DishType) => {
    setAddGroupType(type);
    setGroupSelectedIds([]);
    setSearchPlato("");
    setGroupPrecio(""); // Siempre vacío para que el usuario ingrese el precio del nuevo grupo
  };

  const togglePlatoSelection = (id: string) => {
    setGroupSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const addGroupToEdit = () => {
    if (!editingMenu || !addGroupType || !groupPrecio || groupSelectedIds.length === 0) return;
    const precio = parseFloat(groupPrecio);
    if (isNaN(precio) || precio < 0) { toast.error("Precio inválido"); return; }
    const newRows: MenuItemRow[] = groupSelectedIds
      .map((pid) => catalogo.find((p) => p.id === pid))
      .filter((p): p is Plato => !!p)
      .map((plato) => ({ id: uid(), plato, precio }));
    const updated = { ...editingMenu, items: [...editingMenu.items, ...newRows] };
    setEditingMenu(updated);
    if (editingMenu.fecha === today()) setTodayMenu(updated);
    toast.success(`${newRows.length} plato(s) agregado(s) a ${DISH_CONFIG[addGroupType].label} a S/ ${precio.toFixed(2)}`);
    setAddGroupType(null); setGroupSelectedIds([]); setGroupPrecio("");
  };

  // Actualiza el precio de un sub-grupo específico (por tipo + precio viejo)
  const updateSubGroupPrice = (type: DishType, oldPrecio: number, newPrecio: number) => {
    if (!editingMenu || isNaN(newPrecio) || newPrecio < 0) return;
    const updated = {
      ...editingMenu,
      items: editingMenu.items.map((it) =>
        it.plato.tipo === type && it.precio === oldPrecio ? { ...it, precio: newPrecio } : it
      ),
    };
    setEditingMenu(updated);
    if (editingMenu.fecha === today()) setTodayMenu(updated);
  };

  const removeItemFromEdit = (itemId: string) => {
    if (!editingMenu) return;
    const updated = { ...editingMenu, items: editingMenu.items.filter((it) => it.id !== itemId) };
    setEditingMenu(updated); if (editingMenu.fecha === today()) setTodayMenu(updated);
  };

  const saveMenu = () => {
    if (!editingMenu) return;
    if (editingMenu.items.length === 0) { toast.error("El menú debe tener al menos un plato"); return; }
    setHistory((prev) => {
      const idx = prev.findIndex((m) => m.fecha === editingMenu.fecha);
      if (idx >= 0) { const c = [...prev]; c[idx] = editingMenu; return c; }
      return [editingMenu, ...prev];
    });
    if (editingMenu.fecha === today()) setTodayMenu(editingMenu);
    setEditingMenu(null); toast.success("¡Menú guardado exitosamente!");
  };

  const handleCreatePlato = () => {
    if (!newPlatoNombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    const plato: Plato = { id: uid(), nombre: newPlatoNombre.trim(), descripcion: newPlatoDesc.trim(), tipo: newPlatoTipo };
    setCatalogo((prev) => [...prev, plato]);
    setNewPlatoNombre(""); setNewPlatoDesc(""); setNewPlatoTipo("segundo");
    setShowCreatePlato(false); toast.success(`"${plato.nombre}" creado`);
  };

  const handleUpdatePlato = () => {
    if (!editingPlato || !editingPlato.nombre.trim()) return;
    setCatalogo((prev) => prev.map((p) => p.id === editingPlato.id ? editingPlato : p));
    setEditingPlato(null); toast.success("Plato actualizado");
  };

  const handleDeletePlato = (id: string) => {
    setCatalogo((prev) => prev.filter((p) => p.id !== id));
    toast.success("Plato eliminado del catálogo");
  };

  // Renderiza grupos de precio dentro de un tipo, editable o solo lectura
  const renderMealGroup = (type: DishType, items: MenuItemRow[], editable: boolean) => {
    if (!editable && items.length === 0) return null;

    // Sub-grupos por precio
    const priceMap = new Map<number, MenuItemRow[]>();
    for (const it of items) {
      if (!priceMap.has(it.precio)) priceMap.set(it.precio, []);
      priceMap.get(it.precio)!.push(it);
    }
    const subGroups = Array.from(priceMap.entries()).map(([precio, its]) => ({ precio, items: its }));

    return (
      <div key={type} className="space-y-3">
        {/* Cabecera del tipo */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Pill type={type} />
            <span className="text-xs text-gray-400">{items.length} plato{items.length !== 1 ? "s" : ""}</span>
          </div>
          {editable && (
            <button
              onClick={() => openAddGroup(type)}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#aa4918] text-[#aa4918] hover:bg-[#fdf0ea] text-xs font-semibold transition-colors"
            >
              <Plus size={13} /> Agregar platos
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-gray-400 italic px-1">Sin platos en este grupo</p>
        ) : (
          <div className="space-y-3">
            {subGroups.map(({ precio, items: subItems }) => (
              <div key={precio} className="rounded-xl border border-orange-100 overflow-hidden">
                {/* Sub-cabecera de precio */}
                <div className="flex items-center justify-between px-4 py-2 bg-orange-50/60 border-b border-orange-100">
                  <span className="text-xs text-gray-500 font-semibold">Precio del grupo</span>
                  {editable ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500 font-mono">S/</span>
                      <Input
                        type="number"
                        defaultValue={precio}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0 && val !== precio) {
                            updateSubGroupPrice(type, precio, val);
                          }
                        }}
                        className="w-20 h-7 text-sm text-right focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-bold font-mono text-gray-800">S/ {precio.toFixed(2)}</span>
                  )}
                </div>
                {/* Items del sub-grupo */}
                <div className="divide-y divide-orange-50 bg-white">
                  {subItems.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{it.plato.nombre}</p>
                        <p className="text-xs text-gray-400 truncate">{it.plato.descripcion}</p>
                      </div>
                      {editable && (
                        <button onClick={() => removeItemFromEdit(it.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const platoFormFields = (
    nombre: string, setNombre: (v: string) => void,
    desc: string, setDesc: (v: string) => void,
    tipo: DishType, setTipo: (v: DishType) => void,
  ) => (
    <div className="space-y-4 pt-1">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">Nombre</Label>
        <Input placeholder="Ej: Ceviche mixto" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">Descripción (opcional)</Label>
        <Input placeholder="Breve descripción" value={desc} onChange={(e) => setDesc(e.target.value)}
          className="focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">Tipo</Label>
        <Select value={tipo} onValueChange={(v) => setTipo(v as DishType)}>
          <SelectTrigger className="focus:ring-[#aa4918]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DISH_TYPES.map((t) => <SelectItem key={t} value={t}>{DISH_CONFIG[t].label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (editingMenu) {
    const grouped = groupByType(editingMenu.items);
    const isToday = editingMenu.fecha === today();
    return (
      <>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setEditingMenu(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#aa4918] hover:text-[#aa4918] hover:bg-[#fdf0ea] transition-colors">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <div className="flex items-center gap-2.5">
                    <ChefHat className="text-[#aa4918]" size={20} />
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isToday ? "Menú de Hoy" : `Menú ${formatDate(editingMenu.fecha)}`}
                    </h1>
                  </div>
                  <p className="text-sm text-gray-500 pl-7">Editando menú — {editingMenu.items.length} platos</p>
                </div>
              </div>
              <Button onClick={saveMenu} className="gap-2 bg-[#aa4918] hover:bg-[#c05520] text-white">
                <Save size={15} /> Guardar menú
              </Button>
            </div>

            {editingMenu.items.length === 0 ? (
              <div className="bg-white border border-orange-100 rounded-2xl flex flex-col items-center justify-center py-20 text-center shadow-sm">
                <UtensilsCrossed className="text-gray-300 mb-4" size={48} />
                <p className="font-semibold text-gray-500">No hay platos en este menú</p>
                <p className="text-sm text-gray-400 mt-1">Usa "Agregar platos" en cada grupo para empezar</p>
              </div>
            ) : (
              <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm space-y-6">
                {DISH_TYPES.map((type) => renderMealGroup(type, grouped[type], true))}
              </div>
            )}

            {/* Siempre visible los botones de agregar cuando el menú está vacío */}
            {editingMenu.items.length === 0 && (
              <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm space-y-6">
                {DISH_TYPES.map((type) => renderMealGroup(type, [], true))}
              </div>
            )}

            {/* Add-by-group dialog */}
            <Dialog open={addGroupType !== null} onOpenChange={(o) => { if (!o) { setAddGroupType(null); setSearchPlato(""); } }}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-[#aa4918]">
                    Agregar platos — {addGroupType ? DISH_CONFIG[addGroupType].label : ""}
                  </DialogTitle>
                </DialogHeader>
                {addGroupType && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-gray-700">Precio de este grupo (S/)</Label>
                      <Input type="number" placeholder="Ej: 12.00" value={groupPrecio}
                        onChange={(e) => setGroupPrecio(e.target.value)}
                        className="focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]" />
                      <p className="text-xs text-gray-400">
                        Los platos seleccionados se agregarán con este precio. Puedes tener varios grupos de precio distintos.
                      </p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <Input placeholder="Buscar plato…" value={searchPlato}
                        onChange={(e) => setSearchPlato(e.target.value)}
                        className="pl-9 focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]" />
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1 rounded-xl border border-orange-100 p-2">
                      {(() => {
                        const options = catalogo
                          .filter((p) => p.tipo === addGroupType)
                          .filter((p) => !editingMenu?.items.some((it) => it.plato.id === p.id))
                          .filter((p) => !searchPlato || p.nombre.toLowerCase().includes(searchPlato.toLowerCase()));
                        if (options.length === 0)
                          return <p className="text-sm text-gray-400 text-center py-4">No hay platos disponibles</p>;
                        return options.map((p) => {
                          const checked = groupSelectedIds.includes(p.id);
                          return (
                            <button key={p.id} type="button" onClick={() => togglePlatoSelection(p.id)}
                              className={`w-full flex items-center gap-3 rounded-lg p-2.5 text-left transition-colors ${
                                checked ? "bg-[#fdf0ea] border border-orange-200" : "hover:bg-orange-50/50 border border-transparent"
                              }`}>
                              <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                                checked ? "bg-[#aa4918] border-[#aa4918]" : "border-gray-300"
                              }`}>
                                {checked && <div className="h-2 w-2 rounded-sm bg-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{p.nombre}</p>
                                <p className="text-xs text-gray-400 truncate">{p.descripcion}</p>
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                    <p className="text-xs text-gray-400">{groupSelectedIds.length} plato(s) seleccionado(s)</p>
                  </div>
                )}
                <DialogFooter className="gap-2 pt-2">
                  <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                  <Button onClick={addGroupToEdit} disabled={!groupPrecio || groupSelectedIds.length === 0}
                    className="bg-[#aa4918] hover:bg-[#c05520] text-white">
                    Agregar {groupSelectedIds.length > 0 ? `(${groupSelectedIds.length})` : ""}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </>
    );
  }

  if (viewingMenu) {
    const grouped = groupByType(viewingMenu.items);
    return (
      <>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setViewingMenu(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#aa4918] hover:text-[#aa4918] hover:bg-[#fdf0ea] transition-colors">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <div className="flex items-center gap-2.5">
                    <ChefHat className="text-[#aa4918]" size={20} />
                    <h1 className="text-2xl font-bold text-gray-900">Menú {formatDate(viewingMenu.fecha)}</h1>
                  </div>
                  <p className="text-sm text-gray-500 pl-7">{viewingMenu.items.length} platos</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2 border-[#aa4918] text-[#aa4918] hover:bg-[#fdf0ea]"
                onClick={() => { setEditingMenu(viewingMenu); setViewingMenu(null); }}>
                <Pencil size={14} /> Editar menú
              </Button>
            </div>
            <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm space-y-6">
              {DISH_TYPES.map((type) => renderMealGroup(type, grouped[type], false))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const catalogoByType = catalogo.reduce<Record<DishType, Plato[]>>(
    (acc, p) => { acc[p.tipo].push(p); return acc; },
    { entrada: [], segundo: [], postre: [], bebida: [] }
  );

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="flex items-center gap-2.5 mb-1">
            <ChefHat className="text-[#aa4918]" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menú del Día</h1>
              <p className="text-sm text-gray-500">Gestiona los menús diarios y el catálogo de platos</p>
            </div>
          </div>

          <Tabs defaultValue="hoy" className="w-full">
            <TabsList className="bg-white border border-orange-100 rounded-xl p-1 h-auto gap-1 shadow-sm">
              <TabsTrigger value="hoy"
                className="gap-2 rounded-lg data-[state=active]:bg-[#aa4918] data-[state=active]:text-white data-[state=active]:shadow-none px-4 py-2 text-sm font-semibold text-gray-600 transition-all">
                <UtensilsCrossed size={14} /> Hoy
              </TabsTrigger>
              <TabsTrigger value="historial"
                className="gap-2 rounded-lg data-[state=active]:bg-[#aa4918] data-[state=active]:text-white data-[state=active]:shadow-none px-4 py-2 text-sm font-semibold text-gray-600 transition-all">
                <Calendar size={14} /> Historial
              </TabsTrigger>
              <TabsTrigger value="catalogo"
                className="gap-2 rounded-lg data-[state=active]:bg-[#aa4918] data-[state=active]:text-white data-[state=active]:shadow-none px-4 py-2 text-sm font-semibold text-gray-600 transition-all">
                <BookOpen size={14} /> Platos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hoy" className="mt-5">
              {todayMenu ? (
                <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#aa4918]">
                        Menú — {formatDate(todayMenu.fecha)}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">{todayMenu.items.length} platos configurados</p>
                    </div>
                    <Button variant="outline" size="sm"
                      className="gap-1.5 border-[#aa4918] text-[#aa4918] hover:bg-[#fdf0ea] text-xs"
                      onClick={() => setEditingMenu(todayMenu)}>
                      <Pencil size={12} /> Editar menú
                    </Button>
                  </div>
                  <div className="p-6 space-y-6">
                    {DISH_TYPES.map((type) => renderMealGroup(type, groupByType(todayMenu.items)[type], false))}
                    {todayMenu.items.length === 0 && (
                      <p className="text-center text-gray-400 py-8 text-sm">
                        Menú vacío — haz clic en "Editar menú" para agregar platos
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-orange-100 rounded-2xl flex flex-col items-center justify-center py-20 text-center shadow-sm">
                  <Calendar className="text-gray-200 mb-4" size={56} />
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No hay menú para hoy</h3>
                  <p className="text-sm text-gray-400 mb-7 max-w-sm">
                    Crea un nuevo menú o duplica el último configurado
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={createTodayMenu} className="gap-2 bg-[#aa4918] hover:bg-[#c05520] text-white">
                      <Plus size={15} /> Crear menú de hoy
                    </Button>
                    {history.length > 0 && (
                      <Button variant="outline" onClick={duplicateFromPrevious}
                        className="gap-2 border-[#aa4918] text-[#aa4918] hover:bg-[#fdf0ea]">
                        <Copy size={15} /> Duplicar último
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="historial" className="mt-5">
              <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#aa4918]">Historial de Menús</span>
                </div>
                {history.length === 0 ? (
                  <p className="text-center text-gray-400 py-12 text-sm">No hay menús anteriores</p>
                ) : (
                  <div className="divide-y divide-orange-50">
                    {history.map((menu) => {
                      const grouped = groupByType(menu.items);
                      const activeTypes = DISH_TYPES.filter((t) => grouped[t].length > 0);
                      return (
                        <div key={menu.id} className="flex items-center justify-between px-5 py-4 hover:bg-orange-50/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#fdf0ea] flex items-center justify-center flex-shrink-0">
                              <Calendar className="text-[#aa4918]" size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{formatDate(menu.fecha)}</p>
                              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                {activeTypes.map((type) => (
                                  <Pill key={type} type={type} count={grouped[type].length} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="ghost" size="sm"
                              className="gap-1.5 h-8 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              onClick={() => setViewingMenu(menu)}>
                              <Eye size={12} /> Ver
                            </Button>
                            <Button variant="outline" size="sm"
                              className="gap-1.5 h-8 text-xs border-[#aa4918] text-[#aa4918] hover:bg-[#fdf0ea]"
                              onClick={() => setEditingMenu(menu)}>
                              <Pencil size={12} /> Editar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="catalogo" className="mt-5 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Administra tu catálogo base. Estos platos se usan al armar los menús diarios.
                </p>
                <Dialog open={showCreatePlato} onOpenChange={setShowCreatePlato}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-[#aa4918] hover:bg-[#c05520] text-white shrink-0">
                      <Plus size={15} /> Nuevo plato
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle className="text-[#aa4918]">Crear nuevo plato</DialogTitle></DialogHeader>
                    {platoFormFields(newPlatoNombre, setNewPlatoNombre, newPlatoDesc, setNewPlatoDesc, newPlatoTipo, setNewPlatoTipo)}
                    <DialogFooter className="gap-2 pt-2">
                      <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                      <Button onClick={handleCreatePlato} disabled={!newPlatoNombre.trim()}
                        className="bg-[#aa4918] hover:bg-[#c05520] text-white">Crear</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Dialog open={!!editingPlato} onOpenChange={(o) => !o && setEditingPlato(null)}>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle className="text-[#aa4918]">Editar plato</DialogTitle></DialogHeader>
                  {editingPlato && platoFormFields(
                    editingPlato.nombre, (v) => setEditingPlato({ ...editingPlato, nombre: v }),
                    editingPlato.descripcion, (v) => setEditingPlato({ ...editingPlato, descripcion: v }),
                    editingPlato.tipo, (v) => setEditingPlato({ ...editingPlato, tipo: v }),
                  )}
                  <DialogFooter className="gap-2 pt-2">
                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                    <Button onClick={handleUpdatePlato} className="bg-[#aa4918] hover:bg-[#c05520] text-white">Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {DISH_TYPES.map((type) => {
                const items = catalogoByType[type]; if (items.length === 0) return null;
                return (
                  <div key={type} className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
                      <Pill type={type} />
                      <span className="text-xs text-gray-400">{items.length} platos</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {items.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 rounded-xl border border-orange-50 bg-white px-4 py-3 hover:bg-orange-50/30 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">{p.nombre}</p>
                            <p className="text-xs text-gray-400 truncate">{p.descripcion || "Sin descripción"}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => setEditingPlato({ ...p })}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#aa4918] hover:bg-[#fdf0ea] transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDeletePlato(p.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}