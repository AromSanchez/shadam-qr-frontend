"use client";

import { useState } from "react";
import { QrCode, CheckCircle2, XCircle, Search, User, CreditCard, Clock, Utensils } from "lucide-react";
import { Pensionist } from "@/lib/mock-db";

export default function ReceptionValidatePage() {
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pensionist, setPensionist] = useState<Pensionist | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock receptionist ID
  const receptionistId = "user_recepcion";

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput) return;

    setLoading(true);
    setError(null);
    setPensionist(null);
    setActionMessage(null);

    try {
      const res = await fetch("/api/pensionists/validate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qrInput })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Código inválido");
      } else {
        setPensionist(data);
      }
    } catch (e) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterConsumption = async (mealType: string) => {
    if (!pensionist) return;
    
    setIsProcessing(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/pensionists/register-consumption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pensionistId: pensionist.id,
          mealType,
          validatedBy: receptionistId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setActionMessage({ type: "error", text: data.error });
      } else {
        setActionMessage({ type: "success", text: `¡${mealType.charAt(0).toUpperCase() + mealType.slice(1)} registrado con éxito!` });
        // Update local credits display
        setPensionist(prev => prev ? {
          ...prev,
          breakfastCredits: data.remainingCredits.breakfast,
          lunchCredits: data.remainingCredits.lunch,
          dinnerCredits: data.remainingCredits.dinner,
        } : null);
      }
    } catch (e) {
      setActionMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] p-6 font-sans pb-32">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">Recepción</h1>
            <p className="text-slate-500 text-sm font-medium">Validación de Pensionistas</p>
          </div>
        </div>

        {/* Scanner Form */}
        <form onSubmit={handleValidate} className="bg-white dark:bg-white/5 rounded-[2rem] p-6 shadow-xl border border-slate-200 dark:border-white/10 mb-8">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
            Ingresar o Escanear QR
          </label>
          <div className="relative">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Ej. PEN-0001"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </div>
          <button 
            type="submit"
            disabled={loading || !qrInput}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/30"
          >
            {loading ? "Verificando..." : "Validar Código"}
          </button>

          {/* Validation Error */}
          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-700 dark:text-red-400 font-bold">Acceso Denegado</h4>
                <p className="text-red-600/80 dark:text-red-400/80 text-sm">{error}</p>
              </div>
            </div>
          )}
        </form>

        {/* Pensionist Profile & Actions */}
        {pensionist && (
          <div className="space-y-6">
            <div className="bg-emerald-500 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{pensionist.fullName}</h2>
                    <p className="text-emerald-100 font-mono text-sm">{pensionist.code} • DNI: {pensionist.dni}</p>
                  </div>
                </div>
                <div className="bg-white text-emerald-600 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                  Activo
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-emerald-600/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
                    <CreditCard className="w-3.5 h-3.5" /> Plan
                  </div>
                  <p className="text-lg font-bold capitalize">{pensionist.planType}</p>
                </div>
                <div className="bg-emerald-600/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
                    <Clock className="w-3.5 h-3.5" /> Vence
                  </div>
                  <p className="text-lg font-bold">{new Date(pensionist.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Action Message (Success/Error of Consumption) */}
            {actionMessage && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 border ${actionMessage.type === "error" ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400" : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
                {actionMessage.type === "error" ? <XCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                <p className="font-bold text-sm">{actionMessage.text}</p>
              </div>
            )}

            {/* Consumption Actions */}
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-6 shadow-xl border border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" /> Registrar Consumo
              </h3>
              
              <div className="space-y-4">
                <button 
                  onClick={() => handleRegisterConsumption("desayuno")}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xl shadow-sm">☕</div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-900 dark:text-white">Desayuno</h4>
                      <p className="text-xs text-slate-500">{pensionist.breakfastCredits} cupos restantes</p>
                    </div>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    Descontar
                  </div>
                </button>

                <button 
                  onClick={() => handleRegisterConsumption("almuerzo")}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xl shadow-sm">🍛</div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-900 dark:text-white">Almuerzo</h4>
                      <p className="text-xs text-slate-500">{pensionist.lunchCredits} cupos restantes</p>
                    </div>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    Descontar
                  </div>
                </button>

                <button 
                  onClick={() => handleRegisterConsumption("cena")}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xl shadow-sm">🍲</div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-900 dark:text-white">Cena</h4>
                      <p className="text-xs text-slate-500">{pensionist.dinnerCredits} cupos restantes</p>
                    </div>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    Descontar
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
