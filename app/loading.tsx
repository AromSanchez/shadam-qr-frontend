export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo Pulse */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 animate-pulse shadow-xl shadow-primary/30" />
          <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 animate-ping opacity-20" />
        </div>

        {/* Skeleton Cards */}
        <div className="w-72 space-y-4">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" style={{ animationDelay: "200ms" }} />
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" style={{ animationDelay: "400ms" }} />
          </div>
        </div>

        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 animate-pulse">
          Cargando...
        </p>
      </div>
    </div>
  );
}
