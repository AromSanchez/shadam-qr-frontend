"use client";

import { useState, useEffect } from "react";
import { IdCard, Lock, ArrowRight, ShieldCheck, User, CheckCircle2, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function PensionistaLoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  // Estados generales
  const [step, setStep] = useState<"login" | "first_time">("login");
  
  // Paso 1: Login
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Paso 2: Primer ingreso
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Redirigir si ya está logueado y no está en el flujo de primer ingreso
  useEffect(() => {
    if (user && user.role === "pensionista" && step !== "first_time") {
      router.replace("/pensionista");
    }
  }, [user, router, step]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim() || !password.trim()) return;

    try {
      setLoginLoading(true);
      setLoginError(null);
      
      // Intentar login real contra el backend
      const res = await login({ email: dni.trim(), password: password.trim() });
      
      if (res && res.success) {
        // Login real exitoso
        login({ role: "pensionista", code: dni.trim().toUpperCase() });

        if (res.first_login) {
          setStep("first_time");
        } else {
          router.replace("/pensionista");
        }
        return;
      }

      // Si el backend rechazó, usar modo demo como fallback temporal
      login({
        role: "pensionista",
        name: "Pensionista Demo",
        code: dni.trim().toUpperCase(),
        dni: dni.trim(),
        planType: "cupos",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        breakfastCredits: 10,
        lunchCredits: 20,
        dinnerCredits: 10,
        status: "activo",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
      });
      router.replace("/pensionista");
      
    } catch (err) {
      setLoginError("Error de conexión con el servidor. Intenta de nuevo.");
      setLoginLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setUpdateError("Las contraseñas no coinciden");
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError(null);

      // AQUI IRÍA LA LLAMADA AL BACKEND PARA ACTUALIZAR DATOS:
      // await fetch('/api/pensionists/update-profile', { method: 'POST', body: JSON.stringify({ password: newPassword, phone }) })
      
      // Simulamos la actualización correcta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Una vez actualizado, lo mandamos al dashboard
      router.replace("/pensionista");
      
    } catch (err) {
      setUpdateError("No se pudieron guardar los datos.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const skipUpdate = () => {
    router.replace("/pensionista");
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glow Effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-500" />

      <AnimatePresence mode="wait">
        {step === "login" ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md z-10"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-[2rem] shadow-xl shadow-cyan-500/10 mb-6">
                <User className="w-10 h-10 text-cyan-400" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white mb-3 leading-tight">Acceso<br/>Pensionistas</h1>
              <p className="text-slate-300 text-lg">Ingresa para ver tu carnet y consumos.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                
                {/* DNI or Email Field */}
                <div className="space-y-3">
                  <label htmlFor="dni" className="block text-lg font-bold text-slate-200 ml-2">
                    DNI o Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <IdCard className="w-7 h-7 text-cyan-500/70" />
                    </div>
                    <input
                      id="dni"
                      type="text"
                      required
                      placeholder="Ej: 70123456 o correo@ejemplo.com"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className="w-full h-[4.5rem] bg-white/5 border-2 border-white/10 rounded-[1.5rem] pl-16 pr-5 text-xl font-black focus:outline-none focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-white placeholder-slate-500 tracking-wider"
                      aria-label="DNI o Correo Electrónico"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-lg font-bold text-slate-200 ml-2 flex justify-between items-center">
                    <span>Contraseña</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Lock className="w-7 h-7 text-cyan-500/70" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[4.5rem] bg-white/5 border-2 border-white/10 rounded-[1.5rem] pl-16 pr-5 text-2xl font-black focus:outline-none focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-white placeholder-slate-600 tracking-widest"
                      aria-label="Contraseña"
                    />
                  </div>
                  <p className="text-sm text-cyan-200/80 bg-cyan-500/10 px-4 py-2.5 rounded-xl border border-cyan-500/20 font-medium">
                    <span className="font-bold text-cyan-400">💡 Tip:</span> Si es tu primera vez, tu contraseña es tu mismo número de DNI.
                  </p>
                </div>

                {loginError && (
                  <div className="bg-red-500/10 border-2 border-red-500/30 text-red-400 p-4 rounded-xl text-base text-center font-bold" role="alert">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="relative w-full h-[4.5rem] mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-[1.5rem] font-black text-xl tracking-wider transition-all disabled:opacity-80 flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-cyan-500/30 active:scale-95"
                  aria-label="Ingresar al portal"
                >
                  {loginLoading ? (
                    <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Ingresar</span>
                      <ArrowRight className="w-7 h-7" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="first_time"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md z-10"
          >
            <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 p-1 rounded-[2.5rem] shadow-2xl shadow-cyan-500/20">
               <div className="bg-[#060913] rounded-[2.4rem] p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
                 
                 <div className="flex flex-col items-center text-center mb-8 relative z-10">
                   <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                     <ShieldCheck className="w-8 h-8 text-emerald-400" />
                   </div>
                   <h2 className="text-3xl font-black text-white mb-2">¡Bienvenido por primera vez!</h2>
                   <p className="text-slate-300 text-base">
                     Para tu seguridad, te recomendamos cambiar tu contraseña temporal (tu DNI) por una nueva.
                   </p>
                 </div>

                 <form onSubmit={handleUpdateSubmit} className="space-y-5 relative z-10">
                   
                   {/* Nueva Contraseña */}
                   <div className="space-y-2">
                     <label className="block text-base font-bold text-slate-200 ml-1">
                       Nueva Contraseña (Opcional)
                     </label>
                     <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                       <input
                         type="password"
                         value={newPassword}
                         onChange={(e) => setNewPassword(e.target.value)}
                         placeholder="Ingresa nueva clave"
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-xl focus:ring-2 focus:ring-cyan-500 transition-all text-white"
                       />
                     </div>
                   </div>

                   {/* Confirmar Contraseña */}
                   {newPassword && (
                     <div className="space-y-2">
                       <label className="block text-base font-bold text-slate-200 ml-1">
                         Repite tu nueva contraseña
                       </label>
                       <div className="relative">
                         <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                         <input
                           type="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           placeholder="Repítela aquí"
                           className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-xl focus:ring-2 focus:ring-cyan-500 transition-all text-white"
                         />
                       </div>
                     </div>
                   )}

                   {/* Teléfono */}
                   <div className="space-y-2">
                     <label className="block text-base font-bold text-slate-200 ml-1">
                       Teléfono de Contacto (Opcional)
                     </label>
                     <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                       <input
                         type="tel"
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         placeholder="Ej: 999 888 777"
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-xl focus:ring-2 focus:ring-cyan-500 transition-all text-white"
                       />
                     </div>
                   </div>

                   {updateError && (
                     <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-bold">
                       {updateError}
                     </div>
                   )}

                   <div className="pt-4 space-y-4">
                     <button
                       type="submit"
                       disabled={updateLoading}
                       className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20"
                     >
                       {updateLoading ? (
                         <div className="w-6 h-6 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                         "Guardar y Continuar"
                       )}
                     </button>
                     
                     <button
                       type="button"
                       onClick={skipUpdate}
                       className="w-full py-3 text-slate-400 hover:text-white text-base font-bold transition-colors underline underline-offset-4"
                     >
                       Mantener datos actuales y entrar
                     </button>
                   </div>

                 </form>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
