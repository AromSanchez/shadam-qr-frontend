"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  FileSpreadsheet,
  History,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Users,
  Wallet,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Pensionista {
  id: number | string;
  name: string;
  email: string;
  role: "pensioner" | string;
  balance: string | number;
  first_login: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const message = (data as { message?: unknown; error?: unknown }).message ?? (data as { error?: unknown }).error;
    if (typeof message === "string") return message;
  }

  return fallback;
}

function formatCurrency(value: string | number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "S/ 0.00";
  }

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}

function StatusBadge({ active }: { active: boolean }) {
  if (!active) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        Inactivo
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
      Activo
    </span>
  );
}

function Initials({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const parts = name.trim().split(" ").filter(Boolean);
  const initials =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2);
  const cls = size === "md" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";

  return (
    <span
      className={`${cls} rounded-full bg-primary/10 text-[#06b6d4] font-bold flex items-center justify-center flex-shrink-0 uppercase`}
    >
      {initials}
    </span>
  );
}

export default function PensionistasPage() {
  const [data, setData] = useState<Pensionista[]>([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | number | null>(null);

  const [newName, setNewName] = useState("");
  const [newDni, setNewDni] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users/pensioners", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        toast.error(getErrorMessage(json, "No se pudieron cargar los pensionistas"));
        setData([]);
        return;
      }

      setData(Array.isArray(json) ? json : []);
    } catch {
      toast.error("Error de conexion al cargar pensionistas");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;

    return data.filter((p) => {
      const dni = String(p.email ?? "");
      return p.name.toLowerCase().includes(term) || dni.toLowerCase().includes(term);
    });
  }, [data, search]);

  const totalActive = data.filter((p) => p.is_active).length;

  const handleAdd = async () => {
    const name = newName.trim();
    const dni = newDni.trim();

    if (!name || !dni) {
      toast.error("Completa nombre y DNI");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dni }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(getErrorMessage(json, "No se pudo crear el pensionista"));
        return;
      }

      toast.success("Pensionista agregado exitosamente");
      setAddOpen(false);
      setNewName("");
      setNewDni("");
      await fetchData();
    } catch {
      toast.error("Error de conexion al crear pensionista");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (pensionista: Pensionista) => {
    try {
      setTogglingId(pensionista.id);
      const res = await fetch(`/api/users/${pensionista.id}/toggle`, {
        method: "PATCH",
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(getErrorMessage(json, "Aun no se pudo cambiar el estado desde el backend"));
        return;
      }

      toast.success(pensionista.is_active ? "Cuenta desactivada" : "Cuenta activada");
      await fetchData();
    } catch {
      toast.error("Error de conexion al cambiar el estado");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Activos</span>
              <span className="text-sm font-bold text-foreground">{totalActive}</span>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
              <Wallet size={13} className="text-[#06b6d4]" />
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-bold text-foreground">{data.length}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <Users className="text-[#06b6d4]" size={22} />
                <h1 className="text-2xl font-bold text-foreground">Pensionistas</h1>
              </div>
              <p className="text-sm text-muted-foreground pl-8">Gestion de usuarios con saldo prepagado</p>
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-[#06b6d4] hover:bg-primary/90 text-white w-full sm:w-auto">
                  <Plus size={15} /> Nuevo pensionista
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-[#06b6d4]">Agregar pensionista</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-foreground">Nombre completo</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ej. Carlos Mendez"
                      className="focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-foreground">DNI</Label>
                    <Input
                      value={newDni}
                      onChange={(e) => setNewDni(e.target.value)}
                      placeholder="8 digitos"
                      inputMode="numeric"
                      className="focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 border-dashed"
                    onClick={() => toast.info("Importacion desde Excel proximamente")}
                  >
                    <FileSpreadsheet size={14} /> Importar desde Excel
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={creating}
                    className="w-full bg-[#06b6d4] hover:bg-primary/90 text-white gap-2"
                  >
                    {creating && <Loader2 size={14} className="animate-spin" />}
                    Agregar pensionista
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <Input
              placeholder="Buscar pensionista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
            />
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {loading && (
              <p className="text-sm text-muted-foreground text-center py-8">Cargando pensionistas...</p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No se encontraron resultados</p>
            )}
            {!loading &&
              filtered.map((p) => {
                const balance = Number(p.balance);
                return (
                  <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 pt-4 pb-3 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <Initials name={p.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">DNI: {p.email}</p>
                        </div>
                        <StatusBadge active={p.is_active} />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        <span className="text-xs text-muted-foreground">Saldo</span>
                        <span className={`font-mono font-bold text-base ${balance < 0 ? "text-red-500" : "text-foreground"}`}>
                          {formatCurrency(p.balance)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 border-t border-border">
                      <button
                        onClick={() => toast.info("Recargas proximamente")}
                        className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#06b6d4] hover:bg-primary/10 transition-colors border-r border-border"
                      >
                        <RefreshCw size={13} /> Recargar
                      </button>
                      <button
                        onClick={() => toast.info("Historial proximamente")}
                        className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors border-r border-border"
                      >
                        <History size={13} /> Historial
                      </button>
                      <button
                        onClick={() => handleToggleActive(p)}
                        disabled={togglingId === p.id}
                        className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                      >
                        {p.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                        {p.is_active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
                Listado de pensionistas
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5">
                    Nombre
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                    Saldo
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Estado
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right pr-5">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                      Cargando pensionistas...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                      No se encontraron resultados
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  filtered.map((p) => {
                    const balance = Number(p.balance);
                    return (
                      <TableRow key={p.id} className="border-border hover:bg-muted/40 transition-colors">
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-2.5">
                            <Initials name={p.name} />
                            <div>
                              <span className="font-medium text-foreground text-sm block">{p.name}</span>
                              <span className="text-xs text-muted-foreground">DNI: {p.email}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className={`font-mono font-bold text-sm ${balance < 0 ? "text-red-500" : "text-foreground"}`}>
                            {formatCurrency(p.balance)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <StatusBadge active={p.is_active} />
                        </TableCell>

                        <TableCell className="text-right pr-5">
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-8 text-xs border-[#06b6d4] text-[#06b6d4] hover:bg-primary/10 hover:text-[#06b6d4]"
                              onClick={() => toast.info("Recargas proximamente")}
                            >
                              <RefreshCw size={12} /> Recargar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                              onClick={() => toast.info("Historial proximamente")}
                            >
                              <History size={12} /> Historial
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={togglingId === p.id}
                              className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50"
                              onClick={() => handleToggleActive(p)}
                            >
                              {togglingId === p.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : p.is_active ? (
                                <UserX size={12} />
                              ) : (
                                <UserCheck size={12} />
                              )}
                              {p.is_active ? "Desactivar" : "Activar"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
