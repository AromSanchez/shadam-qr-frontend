"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, HelpCircle, ChevronDown, ChevronUp, Send, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_DATA = [
  {
    question: "¿Cómo funciona el plan de pensionista?",
    answer: "El plan de pensionista te permite acceder a un número fijo de comidas mensuales. Se descuenta automáticamente al escanear tu QR en el restaurante. Puedes ver tu consumo restante desde el dashboard principal.",
  },
  {
    question: "¿Cómo recargo mi saldo?",
    answer: "Puedes recargar tu saldo desde el dashboard presionando 'Recargar Saldo'. Aceptamos transferencias bancarias, Yape y Plin. El saldo se refleja de manera inmediata.",
  },
  {
    question: "¿Qué hago si mi QR no funciona?",
    answer: "Verifica que tu QR no haya expirado (se renueva cada 45 segundos). Si el problema persiste, cierra y abre la app. También puedes contactar al personal del restaurante para asistencia manual.",
  },
  {
    question: "¿Puedo cancelar un pedido?",
    answer: "Puedes cancelar un pedido dentro de los primeros 2 minutos después de confirmarlo. Pasado ese tiempo, el pedido ya está en preparación y no es posible cancelarlo.",
  },
  {
    question: "¿Los platos del menú pueden variar?",
    answer: "Sí, el menú se actualiza diariamente. Los platos marcados como 'Agotado' ya no están disponibles para ese día. Te recomendamos revisar el menú antes de acudir al restaurante.",
  },
];

export default function SupportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "pensionista") {
      router.replace("/pensionista");
    }
  }, [user, router]);

  if (!user || user.role !== "pensionista") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSend = () => {
    if (message.trim()) {
      setSent(true);
      setMessage("");
      setTimeout(() => setSent(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/pensionista">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
          </Link>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">Centro de Ayuda</h1>
          <div className="w-10 h-10" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
          ¿Tienes dudas? Estamos aquí para ayudarte.
        </p>
      </div>

      <main className="px-6 py-6 space-y-6">
        {/* Quick Contact */}
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:+51999888777" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Llamar</p>
              <p className="text-xs text-slate-500">Línea directa</p>
            </div>
          </a>
          <a href="mailto:soporte@restaurante.com" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Email</p>
              <p className="text-xs text-slate-500">Soporte técnico</p>
            </div>
          </a>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-3">
            {FAQ_DATA.map((faq, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Enviar un Mensaje</h2>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3"
              placeholder="Describe tu problema o consulta..."
              rows={4}
            />

            {sent ? (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl p-4 font-semibold text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ¡Mensaje enviado! Te responderemos pronto.
              </div>
            ) : (
              <Button onClick={handleSend} className="w-full flex gap-2 rounded-2xl h-12 font-bold cursor-pointer" disabled={!message.trim()}>
                <Send className="w-4 h-4" />
                Enviar Mensaje
              </Button>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
