"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, DollarSign, Loader2, Info, Coffee, UtensilsCrossed, Moon } from "lucide-react";
import { Toaster, toast } from "sonner";

interface Prices {
  DESAYUNO: number;
  ALMUERZO: number;
  CENA: number;
}

export default function ConfiguracionPage() {
  const [prices, setPrices] = useState<Prices>({ DESAYUNO: 0, ALMUERZO: 0, CENA: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proxy?path=${encodeURIComponent("/config/prices")}`, {
        credentials: "include",
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error("No se pudieron cargar los precios");
        return;
      }

      setPrices({
        DESAYUNO: json.DESAYUNO ?? 0,
        ALMUERZO: json.ALMUERZO ?? 0,
        CENA: json.CENA ?? 0,
      });
    } catch {
      toast.error("Error de conexion al cargar precios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/proxy?path=${encodeURIComponent("/config/prices")}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          desayuno: prices.DESAYUNO,
          almuerzo: prices.ALMUERZO,
          cena: prices.CENA,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        const message =
          json && typeof json === "object" && typeof json.message === "string"
            ? json.message
            : "No se pudieron guardar los precios";
        toast.error(message);
        return;
      }

      toast.success("Precios actualizados correctamente");
      await fetchPrices();
    } catch {
      toast.error("Error de conexion al guardar precios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <Settings className="text-[#06b6d4]" size={22} />
              <h1 className="text-2xl font-bold text-foreground">Configuracion de Precios</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-8">
              Precios para pensionistas trabajadores (se cobra por consumo)
            </p>
          </div>

          {/* Info card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
            <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-semibold">Como funcionan los precios</p>
              <p>
                Los estudiantes pagan S/ 16.66 cada 3 consumos (precio fijo). Los trabajadores pagan el precio configurado aqui por cada consumo individual.
              </p>
            </div>
          </div>

          {/* Price inputs */}
          {loading ? (
            <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando precios...</span>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
                  Precios por tipo de comida
                </span>
              </div>

              <div className="p-5 space-y-5">
                {/* Desayuno */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Coffee size={15} className="text-amber-500" />
                    Desayuno
                  </Label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      S/
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.50"
                      value={prices.DESAYUNO}
                      onChange={(e) => setPrices((prev) => ({ ...prev, DESAYUNO: parseFloat(e.target.value) || 0 }))}
                      className="pl-9 font-mono font-bold text-lg focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                    />
                  </div>
                </div>

                {/* Almuerzo */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <UtensilsCrossed size={15} className="text-green-600" />
                    Almuerzo
                  </Label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      S/
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.50"
                      value={prices.ALMUERZO}
                      onChange={(e) => setPrices((prev) => ({ ...prev, ALMUERZO: parseFloat(e.target.value) || 0 }))}
                      className="pl-9 font-mono font-bold text-lg focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                    />
                  </div>
                </div>

                {/* Cena */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Moon size={15} className="text-indigo-500" />
                    Cena
                  </Label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      S/
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.50"
                      value={prices.CENA}
                      onChange={(e) => setPrices((prev) => ({ ...prev, CENA: parseFloat(e.target.value) || 0 }))}
                      className="pl-9 font-mono font-bold text-lg focus-visible:ring-[#06b6d4] focus-visible:border-[#06b6d4]"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <DollarSign size={14} />
                    <span>
                      Total diario por trabajador:{" "}
                      <span className="font-mono font-bold text-foreground">
                        S/ {(prices.DESAYUNO + prices.ALMUERZO + prices.CENA).toFixed(2)}
                      </span>
                    </span>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2 bg-[#06b6d4] hover:bg-primary/90 text-white"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
