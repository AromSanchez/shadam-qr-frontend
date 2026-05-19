'use client'

import { usePosContext } from '../../context/PosContext'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}
const colorMap = {
  success: 'var(--pos-success)',
  error: 'var(--pos-danger)',
  warning: 'var(--pos-warning)',
  info: 'var(--pos-primary)',
}

export default function ToastContainer() {
  const { state } = usePosContext()

  if (state.toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)]">
      {state.toasts.map((toast) => {
        const Icon = iconMap[toast.tipo]
        return (
          <div
            key={toast.id}
            className="animate-toast-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border"
            style={{
              backgroundColor: 'var(--pos-card)',
              borderColor: colorMap[toast.tipo],
              color: 'var(--pos-text)',
            }}
          >
            <Icon size={18} style={{ color: colorMap[toast.tipo], flexShrink: 0 }} />
            <span className="text-sm font-medium flex-1">{toast.mensaje}</span>
          </div>
        )
      })}
    </div>
  )
}
