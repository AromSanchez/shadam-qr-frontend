"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracionPage() {
  const [prices, setPrices] = useState({
    breakfast: "5",
    lunch: "8",
    dinner: "8",
  });

  const [debtLimit, setDebtLimit] = useState("100");

  const handleSave = () => {
    // aquí luego puedes conectar API / DB
    toast.success("Configuración guardada exitosamente");
  };

  const handlePriceChange = (field: keyof typeof prices, value: string) => {
    setPrices((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-700">
          Configuración
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Ajusta precios y reglas del sistema del restaurante
        </p>
      </div>

      {/* Precios */}
      <Card className="rounded-xl shadow-sm ring-0 bg-white border-orange-100 border">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-700 mb-1">
            Precios por tipo de comida
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Desayuno (S/)</Label>
              <Input
                type="number"
                value={prices.breakfast}
                onChange={(e) =>
                  handlePriceChange("breakfast", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Almuerzo (S/)</Label>
              <Input
                type="number"
                value={prices.lunch}
                onChange={(e) => handlePriceChange("lunch", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Cena (S/)</Label>
              <Input
                type="number"
                value={prices.dinner}
                onChange={(e) => handlePriceChange("dinner", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Límite de deuda */}
      <Card className="rounded-2xl shadow-sm ring-0 bg-white border-orange-100 border ">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-700 mb-1">
            Límite de deuda
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="max-w-sm space-y-2">
            <Label>Deuda máxima permitida (S/)</Label>
            <Input
              type="number"
              value={debtLimit}
              onChange={(e) => setDebtLimit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Si el cliente supera este monto, no podrá seguir consumiendo en el restaurante.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2 bg-[#aa4918] w-full sm:w-auto">
          <Save className="h-4 w-4" />
          Guardar configuración
        </Button>
      </div>
    </div>
  );
}