"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, RefreshCw, History, Search, Users, Wallet } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Pensionista {
  id: string;
  fullName: string;
  dni: string;
  code: string;
  planType: string;
  balance: number;
  breakfastCredits: number;
  lunchCredits: number;
  dinnerCredits: number;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "inactive")
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        Inactivo
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
      Activo
    </span>
  );
}

function Initials({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  const cls =
    size === "md"
      ? "w-10 h-10 text-sm"
      : "w-8 h-8 text-xs";
  return (
    <span
      className={`${cls} rounded-full bg-[#fdf0ea] text-[#aa4918] font-bold flex items-center justify-center flex-shrink-0 uppercase`}
    >
      {initials}
    </span>
  );
}

export default function PensionistasPage() {
  const [data, setData] = useState<Pensionista[]>([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // New user form
  const [newName, setNewName] = useState("");
  const [newDni, setNewDni] = useState("");
  const [newPlan, setNewPlan] = useState("cupos");

  const [rechargeAmount, setRechargeAmount] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/pensionists");
      const json = await res.json();
      setData(json);
    } catch {
      // Error handled
    } finally {
      // Done loading
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data.filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalActive = data.filter((p) => p.status === "active").length;

  const handleAdd = async () => {
    if (!newName.trim() || !newDni.trim()) { toast.error("Complete los datos"); return; }
    
    try {
      const res = await fetch("/api/pensionists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newName,
          dni: newDni,
          planType: newPlan,
          breakfastCredits: newPlan === "cupos" ? 10 : 0,
          lunchCredits: newPlan === "cupos" ? 20 : 0,
          dinnerCredits: newPlan === "cupos" ? 10 : 0,
          balance: newPlan === "saldo" ? 100 : 0
        })
      });

      if (res.ok) {
        toast.success("Pensionista agregado exitosamente");
        fetchData();
        setAddOpen(false);
        setNewName("");
        setNewDni("");
      }
    } catch {
      toast.error("Error al crear");
    }
  };

  const handleRecharge = () => {
    // In a real app we would PUT to /api/pensionists/[id]/recharge
    toast.success("¡Recarga simulada exitosamente!");
    setRechargeOpen(false);
    setRechargeAmount("");
  };

  const openRecharge = (id: string) => { setSelectedId(id); setRechargeOpen(true); };
  const selectedUser = data.find((p) => p.id === selectedId);

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* ── STATS ── */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-500">Activos</span>
              <span className="text-sm font-bold text-gray-800">{totalActive}</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5 shadow-sm">
              <Wallet size={13} className="text-[#aa4918]" />
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-sm font-bold text-gray-800">{data.length}</span>
            </div>
          </div>

          {/* ── HEADER ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <Users className="text-[#aa4918]" size={22} />
                <h1 className="text-2xl font-bold text-gray-900">Pensionistas</h1>
              </div>
              <p className="text-sm text-gray-500 pl-8">Gestión de usuarios con saldo prepagado</p>
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-[#aa4918] hover:bg-[#c05520] text-white w-full sm:w-auto">
                  <Plus size={15} /> Nuevo pensionista
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-[#aa4918]">Agregar Pensionista</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-gray-700">Nombre completo</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ej. Carlos Méndez"
                      className="focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-gray-700">DNI</Label>
                    <Input
                      value={newDni}
                      onChange={(e) => setNewDni(e.target.value)}
                      placeholder="8 digitos"
                      className="focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-gray-700">Tipo de Plan</Label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-[#aa4918] focus:border-[#aa4918]"
                    >
                      <option value="cupos">Por Cupos (Comidas)</option>
                      <option value="saldo">Por Saldo (Dinero)</option>
                    </select>
                  </div>
                  <Button onClick={handleAdd} className="w-full bg-[#aa4918] hover:bg-[#c05520] text-white">
                    Agregar pensionista
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* ── BUSCADOR ── */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <Input
              placeholder="Buscar pensionista…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]"
            />
          </div>

          {/* ══════════════════════════════════════
              MOBILE: lista de cards (oculto en md+)
          ══════════════════════════════════════ */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No se encontraron resultados</p>
            )}
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* top info */}
                <div className="px-4 pt-4 pb-3 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Initials name={p.fullName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{p.fullName}</p>
                      <p className="text-xs text-gray-400">ID #{p.code}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-orange-50">
                    <span className="text-xs text-gray-500">Plan / Saldo</span>
                    <span
                      className={`font-mono font-bold text-base ${
                        p.balance < 0 ? "text-red-500" : "text-gray-800"
                      }`}
                    >
                      {p.planType === 'cupos' ? `${p.lunchCredits} Cupos` : `S/ ${p.balance.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* actions */}
                <div className="flex border-t border-orange-100">
                  <button
                    onClick={() => openRecharge(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#aa4918] hover:bg-[#fdf0ea] transition-colors border-r border-orange-100"
                  >
                    <RefreshCw size={13} /> Recargar
                  </button>
                  <button
                    onClick={() => toast.info("Historial próximamente 👀")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <History size={13} /> Historial
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════
              DESKTOP: tabla (oculto en mobile)
          ══════════════════════════════════════ */}
          <div className="hidden md:block bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
              <span className="text-xs font-bold uppercase tracking-widest text-[#aa4918]">
                Listado de pensionistas
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-orange-50">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide pl-5">
                    Nombre
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                    Saldo/Cupos
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Estado
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right pr-5">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-gray-400 py-10">
                      No se encontraron resultados
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-orange-50 hover:bg-orange-50/40 transition-colors"
                  >
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2.5">
                         <Initials name={p.fullName} />
                         <div>
                           <span className="font-medium text-gray-800 text-sm block">{p.fullName}</span>
                           <span className="text-xs text-gray-400">{p.code} • DNI: {p.dni}</span>
                         </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <span
                        className={`font-mono font-bold text-sm ${
                          p.balance < 0 ? "text-red-500" : "text-gray-800"
                        }`}
                      >
                        {p.planType === 'cupos' ? `${p.lunchCredits} Cupos` : `S/ ${p.balance.toFixed(2)}`}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>

                    <TableCell className="text-right pr-5">
                      <div className="flex gap-1.5 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 text-xs border-[#aa4918] text-[#aa4918] hover:bg-[#fdf0ea] hover:text-[#aa4918]"
                          onClick={() => openRecharge(p.id)}
                        >
                          <RefreshCw size={12} /> Recargar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 h-8 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          onClick={() => toast.info("Historial próximamente 👀")}
                        >
                          <History size={12} /> Historial
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </div>
      </div>

      {/* ── DIALOG RECARGA ── */}
      <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#aa4918]">Recargar Saldo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3 bg-[#fdf0ea] border border-orange-200 rounded-xl px-4 py-3">
               <Initials name={selectedUser?.fullName ?? "?"} size="md" />
              <div>
                <p className="text-xs text-gray-500">Pensionista</p>
                <p className="text-sm font-semibold text-gray-800">{selectedUser?.fullName}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-500">Saldo/Cupos actual</p>
                <p
                  className={`text-sm font-bold font-mono ${
                    (selectedUser?.balance ?? 0) < 0 ? "text-red-500" : "text-gray-800"
                  }`}
                >
                  {selectedUser?.planType === 'cupos' ? `${selectedUser?.lunchCredits} Cupos` : `S/ ${selectedUser?.balance.toFixed(2)}`}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Cantidad a recargar</Label>
              <Input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="10"
                className="focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]"
              />
            </div>

            <Button
              onClick={handleRecharge}
              className="w-full bg-[#aa4918] hover:bg-[#c05520] text-white gap-2"
            >
              <RefreshCw size={14} /> Confirmar recarga
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}