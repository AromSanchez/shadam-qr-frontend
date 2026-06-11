"use client";

import { usePensioner } from "../context";
import { motion } from "framer-motion";
import { User, Copy, Check, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function QRPage() {
  const { user, loading } = usePensioner();
  const [copied, setCopied] = useState(false);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const qrToken = user.qr_token;

  const handleCopy = async () => {
    if (!qrToken) return;
    try {
      await navigator.clipboard.writeText(qrToken);
      setCopied(true);
      toast.success("Código copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const typeLabel =
    user.pensioner_type === "ESTUDIANTE" ? "Estudiante" :
    user.pensioner_type === "TRABAJADOR" ? "Trabajador" :
    user.pensioner_type || "Pensionista";

  return (
    <div className="px-4 pt-8 pb-4 max-w-md mx-auto flex flex-col items-center min-h-[calc(100vh-5rem)]">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Mi Código QR</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Presenta este código en recepción para que te atiendan
        </p>
      </motion.div>

      {/* QR Display Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-8 w-full shadow-sm flex flex-col items-center"
      >
        {qrToken ? (
          <>
            {/* Real QR Code */}
            <div className="relative p-4 bg-white rounded-2xl shadow-inner mb-6">
              <QRCodeSVG
                value={qrToken}
                size={200}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
              {/* Corner accents */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-cyan-500 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-cyan-500 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-cyan-500 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-cyan-500 rounded-br-lg" />
            </div>

            {/* Token Display */}
            <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center mb-4">
              <p className="text-xs text-slate-400 mb-1 font-medium">Token ID</p>
              <p className="text-lg font-mono font-bold text-slate-900 dark:text-white tracking-wider break-all">
                {qrToken}
              </p>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 transition-colors active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar código
                </>
              )}
            </button>
          </>
        ) : (
          /* No QR token assigned */
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No tienes un código QR asignado
            </p>
            <p className="text-xs text-slate-400 max-w-[240px]">
              Contacta al administrador para que te asigne un código de pensionista.
            </p>
          </div>
        )}
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 p-4 w-full"
      >
        <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-950/30 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-cyan-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user.name}</p>
          <Badge variant="secondary" className="text-[10px] mt-0.5">{typeLabel}</Badge>
        </div>
      </motion.div>
    </div>
  );
}
