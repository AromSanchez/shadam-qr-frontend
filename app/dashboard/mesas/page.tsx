"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Move, LayoutGrid } from "lucide-react";
import { Toaster, toast } from "sonner";

interface TableItem {
  id: string;
  number: number;
  row: number;
  col: number;
}

const initialTables: TableItem[] = [
  { id: "1", number: 1, row: 0, col: 0 },
  { id: "2", number: 2, row: 0, col: 1 },
  { id: "3", number: 3, row: 0, col: 2 },
  { id: "4", number: 4, row: 1, col: 0 },
  { id: "5", number: 5, row: 1, col: 2 },
  { id: "6", number: 6, row: 2, col: 1 },
];

const GRID_ROWS = 4;
const GRID_COLS = 5;

export default function Mesas() {
  const [tables, setTables] = useState(initialTables);
  const [addOpen, setAddOpen] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const findEmptyCell = () => {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!tables.some((t) => t.row === r && t.col === c))
          return { row: r, col: c };
      }
    }
    return null;
  };

  const handleAdd = () => {
    const num = parseInt(newNumber);
    if (!num) { toast.error("Ingrese un número válido"); return; }
    if (tables.some((t) => t.number === num)) { toast.error("Ese número ya existe"); return; }
    const emptyCell = findEmptyCell();
    if (!emptyCell) { toast.error("No hay espacio disponible en el grid"); return; }
    setTables([...tables, { id: Date.now().toString(), number: num, ...emptyCell }]);
    setNewNumber("");
    setAddOpen(false);
    toast.success(`Mesa ${num} agregada`);
  };

  const removeTable = (id: string) => {
    setTables(tables.filter((t) => t.id !== id));
    toast.success("Mesa eliminada");
  };

  const handleDrop = useCallback(
    (row: number, col: number) => {
      if (!dragItem) return;
      if (tables.some((t) => t.row === row && t.col === col && t.id !== dragItem)) return;
      setTables((prev) => prev.map((t) => (t.id === dragItem ? { ...t, row, col } : t)));
      setDragItem(null);
      setDragOver(null);
    },
    [dragItem, tables]
  );

  const occupied = tables.length;
  const total = GRID_ROWS * GRID_COLS;
  const free = total - occupied;

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <LayoutGrid className="text-[#aa4918]" size={22} />
                <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
              </div>
              <p className="text-sm text-gray-500 pl-8">Organiza el layout del restaurante</p>
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-[#aa4918] hover:bg-[#c05520] text-white w-full sm:w-auto">
                  <Plus size={15} /> Nueva Mesa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-[#aa4918]">Agregar Mesa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-gray-700">Número de mesa</Label>
                    <Input
                      type="number"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                      placeholder="Ej: 7"
                      className="focus-visible:ring-[#aa4918] focus-visible:border-[#aa4918]"
                    />
                  </div>
                  <Button onClick={handleAdd} className="w-full bg-[#aa4918] hover:bg-[#c05520] text-white">
                    Agregar mesa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* STATS */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#aa4918]" />
              <span className="text-sm text-gray-500">Ocupadas</span>
              <span className="text-sm font-bold text-gray-800">{occupied}</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-500">Libres</span>
              <span className="text-sm font-bold text-gray-800">{free}</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-4 py-2.5 shadow-sm">
              <LayoutGrid size={13} className="text-[#aa4918]" />
              <span className="text-sm text-gray-500">Total celdas</span>
              <span className="text-sm font-bold text-gray-800">{total}</span>
            </div>
          </div>

          {/* GRID CARD */}
          <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
            {/* card header */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
              <Move size={14} className="text-[#aa4918]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#aa4918]">
                Arrastra las mesas para reorganizarlas
              </span>
            </div>

            {/* grid */}
            <div className="p-5">
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                }}
              >
                {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, idx) => {
                  const row = Math.floor(idx / GRID_COLS);
                  const col = idx % GRID_COLS;
                  const table = tables.find((t) => t.row === row && t.col === col);
                  const cellKey = `${row}-${col}`;
                  const isOver = dragOver === cellKey;

                  return (
                    <div
                      key={cellKey}
                      className={`aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center transition-all
                        ${table
                          ? "border-[#aa4918]/30 bg-[#fdf0ea]/60"
                          : isOver
                          ? "border-[#aa4918] bg-[#fdf0ea]"
                          : "border-gray-200 hover:border-[#aa4918]/30"
                        }`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(cellKey); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={() => handleDrop(row, col)}
                    >
                      {table && (
                        <div
                          draggable
                          onDragStart={() => setDragItem(table.id)}
                          onDragEnd={() => { setDragItem(null); setDragOver(null); }}
                          className="flex flex-col items-center gap-1.5 cursor-grab active:cursor-grabbing p-1 select-none"
                        >
                          {/* mesa circle */}
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#aa4918] text-white font-bold text-lg shadow-sm">
                            {table.number}
                          </div>

                          {/* delete btn */}
                          <button
                            onClick={() => removeTable(table.id)}
                            className="h-6 w-6 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}