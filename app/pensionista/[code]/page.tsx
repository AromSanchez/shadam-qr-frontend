"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QrCode, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function PensionistAutoLoginPage() {
  const params = useParams();
  const router = useRouter();
  const { login } = useAuth();
  const code = params.code as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const autoLogin = async () => {
      if (!code) return;
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch("/api/pensionists/validate-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode: code.toUpperCase() })
        });
        
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Código no válido o inactivo");
        } else {
          const pensionist = await res.json();
          
          // Log in and save session
          login({
            role: "pensionista",
            name: pensionist.fullName,
            code: pensionist.code,
            dni: pensionist.dni,
            planType: pensionist.planType,
            startDate: pensionist.startDate,
            endDate: pensionist.endDate,
            breakfastCredits: pensionist.breakfastCredits,
            lunchCredits: pensionist.lunchCredits,
            dinnerCredits: pensionist.dinnerCredits,
            status: pensionist.status,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
          });

          // Redirect to the main dashboard
          router.replace("/pensionista");
        }
      } catch (e) {
        setError("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, [code, login, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Validando credenciales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6">
          <QrCode size={40} />
        </div>
        <h1 className="text-2xl font-black mb-2">Código Inválido</h1>
        <p className="text-slate-400 text-sm max-w-xs mb-8">{error}</p>
        <button 
          onClick={() => router.replace("/pensionista")}
          className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-2xl font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
        >
          Volver a Intentar
        </button>
      </div>
    );
  }

  return null;
}
