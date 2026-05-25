"use client";
import { useState } from "react";
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
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  Save,
  UtensilsCrossed,
  Tag,
  Layers,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  detail: string;
  showDetail: boolean;
}

interface MenuGroup {
  id: string;
  price: string;
  dishes: MenuItem[];
}

const newId = () => Math.random().toString(36).slice(2, 9);

export default function MenuDelDiaPage() {
  const [entradas, setEntradas] = useState<MenuItem[]>([
    { id: newId(), name: "Sopa criolla", detail: "", showDetail: false },
    { id: newId(), name: "Ensalada fresca", detail: "", showDetail: false },
  ]);
  const [groups, setGroups] = useState<MenuGroup[]>([
    {
      id: newId(),
      price: "12",
      dishes: [
        { id: newId(), name: "Lomo saltado", detail: "Con arroz y papas fritas", showDetail: false },
        { id: newId(), name: "Ají de gallina", detail: "", showDetail: false },
      ],
    },
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const addEntrada = () =>
    setEntradas([...entradas, { id: newId(), name: "", detail: "", showDetail: false }]);
  const removeEntrada = (id: string) =>
    setEntradas(entradas.filter((e) => e.id !== id));
  const updateEntrada = (id: string, field: keyof MenuItem, value: string | boolean) =>
    setEntradas(entradas.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const addGroup = () =>
    setGroups([...groups, {
      id: newId(), price: "",
      dishes: [{ id: newId(), name: "", detail: "", showDetail: false }],
    }]);
  const removeGroup = (id: string) => setGroups(groups.filter((g) => g.id !== id));
  const updateGroupPrice = (id: string, price: string) =>
    setGroups(groups.map((g) => (g.id === id ? { ...g, price } : g)));
  const addDish = (groupId: string) =>
    setGroups(groups.map((g) =>
      g.id === groupId
        ? { ...g, dishes: [...g.dishes, { id: newId(), name: "", detail: "", showDetail: false }] }
        : g
    ));
  const removeDish = (groupId: string, dishId: string) =>
    setGroups(groups.map((g) =>
      g.id === groupId ? { ...g, dishes: g.dishes.filter((d) => d.id !== dishId) } : g
    ));
  const updateDish = (
    groupId: string, dishId: string,
    field: keyof MenuItem, value: string | boolean
  ) =>
    setGroups(groups.map((g) =>
      g.id === groupId
        ? { ...g, dishes: g.dishes.map((d) => (d.id === dishId ? { ...d, [field]: value } : d)) }
        : g
    ));

  const validate = () => {
    if (entradas.length === 0 || entradas.every((e) => !e.name.trim())) {
      toast.error("Se requiere al menos 1 entrada con nombre");
      return false;
    }
    for (const g of groups) {
      if (!g.price.trim()) {
        toast.error("Cada grupo debe tener un precio");
        return false;
      }
      if (g.dishes.length === 0 || g.dishes.every((d) => !d.name.trim())) {
        toast.error("Cada grupo debe tener al menos 1 plato con nombre");
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (validate()) toast.success("¡Menú del día guardado exitosamente!");
  };

  const iconBtnBase =
    "flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center transition-colors";
  const iconBtnNeutral =
    `${iconBtnBase} border-border text-muted-foreground hover:border-[#06b6d4] hover:text-[#06b6d4] hover:bg-[#fdf0ea]`;
  const iconBtnActive =
    `${iconBtnBase} border-[#06b6d4] text-[#06b6d4] bg-[#fdf0ea]`;
  const iconBtnDanger =
    `${iconBtnBase} border-border text-muted-foreground hover:border-red-400 hover:text-red-500 hover:bg-red-50`;

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <UtensilsCrossed className="text-[#06b6d4]" size={22} />
                <h1 className="text-2xl font-bold text-foreground">Menú del Día</h1>
              </div>
              <p className="text-sm text-muted-foreground pl-8">Configura las entradas y grupos de menú</p>
            </div>

            <div className="flex items-center gap-2 flex-col sm:flex-row w-full sm:w-auto">
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-[#06b6d4] text-[#06b6d4] hover:bg-[#fdf0ea] hover:text-[#06b6d4] w-full sm:w-auto"
                  >
                    <Eye size={15} /> Vista previa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-[#06b6d4]">Vista Previa del Menú</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 pt-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#06b6d4] mb-2">
                        Entradas
                      </p>
                      {entradas.filter((e) => e.name.trim()).map((e) => (
                        <div key={e.id} className="text-sm text-gray-700 py-1.5 border-b border-dotted border-border last:border-0">
                          {e.name}
                          {e.detail && <span className="text-muted-foreground italic"> — {e.detail}</span>}
                        </div>
                      ))}
                    </div>
                    {groups.map((g) => (
                      <div key={g.id}>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#06b6d4] mb-2 flex items-center gap-1.5">
                          <Tag size={11} /> Menú S/ {g.price || "?"}
                        </p>
                        {g.dishes.filter((d) => d.name.trim()).map((d) => (
                          <div key={d.id} className="text-sm text-gray-700 py-1.5 border-b border-dotted border-border last:border-0">
                            {d.name}
                            {d.detail && <span className="text-muted-foreground italic"> — {d.detail}</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleSave}
                className="gap-2 bg-[#06b6d4] hover:bg-[#c05520] text-white w-full sm:w-auto"
              >
                <Save size={15} /> Guardar Menú
              </Button>
            </div>
          </div>

          {/* ENTRADAS */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 bg-muted/40 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-[#06b6d4]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
                  Entradas
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={addEntrada}
                className="h-8 gap-1.5 text-xs font-semibold text-[#06b6d4] border border-dashed border-orange-200 hover:bg-[#fdf0ea] hover:border-[#06b6d4]"
              >
                <Plus size={13} /> Agregar
              </Button>
            </div>

            <div className="p-5 space-y-3">
              {entradas.length === 0 && (
                <p className="text-sm text-muted text-center py-2">Sin entradas aún</p>
              )}
              {entradas.map((e) => (
                <div key={e.id}>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Nombre de la entrada…"
                      value={e.name}
                      onChange={(ev) => updateEntrada(e.id, "name", ev.target.value)}
                      className="focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                    />
                    <button
                      onClick={() => updateEntrada(e.id, "showDetail", !e.showDetail)}
                      className={e.showDetail ? iconBtnActive : iconBtnNeutral}
                    >
                      {e.showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => removeEntrada(e.id)} className={iconBtnDanger}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {e.showDetail && (
                    <div className="mt-2 pl-3 border-l-2 border-border">
                      <Input
                        placeholder="Descripción o detalle opcional…"
                        value={e.detail}
                        onChange={(ev) => updateEntrada(e.id, "detail", ev.target.value)}
                        className="focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GRUPOS */}
          {groups.map((group, gi) => (
            <div key={group.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3.5 bg-muted/40 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#06b6d4] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {gi + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
                    Grupo #{gi + 1}
                  </span>
                </div>
                <button
                  onClick={() => removeGroup(group.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} /> Eliminar grupo
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-[#fdf0ea] text-[#06b6d4] border border-orange-200 rounded-lg px-3 py-2 text-sm font-semibold flex-shrink-0">
                    <Tag size={12} /> S/
                  </span>
                  <Input
                    type="number"
                    placeholder="Precio del menú"
                    value={group.price}
                    onChange={(e) => updateGroupPrice(group.id, e.target.value)}
                    className="max-w-[180px] focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                  />
                </div>

                <hr className="border-border" />

                <div className="space-y-3">
                  {group.dishes.map((d) => (
                    <div key={d.id}>
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Nombre del plato…"
                          value={d.name}
                          onChange={(e) => updateDish(group.id, d.id, "name", e.target.value)}
                          className="focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                        />
                        <button
                          onClick={() => updateDish(group.id, d.id, "showDetail", !d.showDetail)}
                          className={d.showDetail ? iconBtnActive : iconBtnNeutral}
                        >
                          {d.showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <button
                          onClick={() => removeDish(group.id, d.id)}
                          className={iconBtnDanger}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {d.showDetail && (
                        <div className="mt-2 pl-3 border-l-2 border-border">
                          <Input
                            placeholder="Descripción o acompañamiento…"
                            value={d.detail}
                            onChange={(e) => updateDish(group.id, d.id, "detail", e.target.value)}
                            className="focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addDish(group.id)}
                  className="h-8 gap-1.5 text-xs font-semibold text-[#06b6d4] border border-dashed border-orange-200 hover:bg-[#fdf0ea] hover:border-[#06b6d4]"
                >
                  <Plus size={13} /> Agregar plato
                </Button>
              </div>
            </div>
          ))}

          {/* ADD GROUP */}
          <button
            onClick={addGroup}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-border text-muted-foreground text-sm font-semibold hover:border-[#06b6d4] hover:text-[#06b6d4] hover:bg-[#fdf0ea] transition-all"
          >
            <Plus size={16} /> Agregar nuevo grupo de menú
          </button>

        </div>
      </div>
    </>
  );
}