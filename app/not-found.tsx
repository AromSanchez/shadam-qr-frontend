import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <span className="text-[120px] font-bold leading-none bg-clip-text text-transparent bg-gradient-to-br from-primary/20 to-cyan-600/20 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-xl shadow-primary/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          Página no encontrada
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe o fue movida a otro lugar.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
