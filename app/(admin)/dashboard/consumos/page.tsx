"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ClipboardList, Search, Calendar, User, Clock, Utensils } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Consumption {
  id: string;
  pensionistId: string;
  pensionistName: string;
  pensionistCode: string;
  mealType: string;
  date: string;
  time: string;
  status: string;
}

export default function ConsumosPage() {
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/consumptions");
      const data = await res.json();
      setConsumptions(data);
    } catch (error) {
      toast.error("Error al cargar consumos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredConsumptions = consumptions.filter(c => 
    c.pensionistName.toLowerCase().includes(search.toLowerCase()) ||
    c.pensionistCode.toLowerCase().includes(search.toLowerCase()) ||
    c.mealType.toLowerCase().includes(search.toLowerCase())
  );

  const getMealEmoji = (type: string) => {
    switch(type.toLowerCase()) {
      case "desayuno": return "☕";
      case "almuerzo": return "🍛";
      case "cena": return "🍲";
      default: return "🍴";
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <Toaster richColors position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <ClipboardList className="text-[#06b6d4]" size={22} />
              <h1 className="text-2xl font-bold text-foreground">Historial de Consumos</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-8">Registro de comidas validadas en recepción</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Buscar por pensionista o tipo..." 
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Pensionista</TableHead>
                <TableHead>Tipo de Comida</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Cargando historial...</TableCell>
                </TableRow>
              ) : filteredConsumptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No hay registros de consumo</TableCell>
                </TableRow>
              ) : (
                filteredConsumptions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{c.pensionistName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-mono">{c.pensionistCode}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMealEmoji(c.mealType)}</span>
                        <span className="text-sm font-medium capitalize">{c.mealType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={14} />
                        {c.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock size={14} />
                        {c.time}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {c.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
