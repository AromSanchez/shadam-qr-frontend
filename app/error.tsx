"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-danger to-rose-600 flex items-center justify-center shadow-xl shadow-danger/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          Algo salió mal
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Ocurrió un error inesperado. Por favor, intenta de nuevo.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Reintentar
          </button>
          <Link
            href="/"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
