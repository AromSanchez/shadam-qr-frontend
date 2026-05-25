"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="text-center max-w-md space-y-8">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <span className="text-[120px] font-bold leading-none bg-clip-text text-transparent bg-gradient-to-br from-primary/30 to-cyan-600/30 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-xl shadow-primary/30">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
         </div>

        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Página no encontrada
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Lo sentimos, la página que buscas no existe o fue movida a otro lugar.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-primary/90 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
