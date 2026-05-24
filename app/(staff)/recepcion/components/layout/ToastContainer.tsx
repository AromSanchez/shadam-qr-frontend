'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { usePosContext } from '../../context/PosContext'
import type { Toast } from '../../lib/types'

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

const COLORS = {
  success: 'var(--pos-success)',
  error:   'var(--pos-danger)',
  warning: 'var(--pos-warning)',
  info:    'var(--pos-primary)',
}

const BG = {
  success: 'var(--pos-success-bg)',
  error:   'var(--pos-danger-bg)',
  warning: 'var(--pos-warning-bg)',
  info:    'var(--pos-primary-dim)',
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tipo = toast.tipo ?? 'info'
  const Icon = ICONS[tipo]
  const color = COLORS[tipo]

  useEffect(() => {
    const dur = toast.duracion ?? 3200
    timerRef.current = setTimeout(() => onDismiss(toast.id), dur)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [toast.id, toast.duracion, onDismiss])

  return (
    <div
      className="animate-toast-in flex items-start gap-3 rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--pos-card)',
        border: '1px solid var(--pos-border)',
        borderLeft: `3px solid ${color}`,
        boxShadow: 'var(--pos-shadow-lg)',
        padding: '12px 14px',
        minWidth: 280,
        maxWidth: 360,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Icon */}
      <div
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
        style={{ backgroundColor: BG[tipo] }}
      >
        <Icon size={15} style={{ color }} />
      </div>

      {/* Message */}
      <p
        className="flex-1 text-sm leading-snug pt-1"
        style={{ color: 'var(--pos-text)', fontFamily: 'Outfit, sans-serif' }}
      >
        {toast.mensaje}
      </p>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-150 hover:opacity-70"
        style={{ color: 'var(--pos-text-muted)' }}
        aria-label="Cerrar notificación"
      >
        <X size={13} />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { state, ocultarToast } = usePosContext()
  const { toasts } = state

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2"
      role="region"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={ocultarToast}
        />
      ))}
    </div>
  )
}
