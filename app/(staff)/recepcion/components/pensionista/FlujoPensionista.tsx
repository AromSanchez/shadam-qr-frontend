'use client'

import { QrCode, Keyboard, ArrowLeft } from 'lucide-react'

interface FlujoPensionistaProps {
  mesaNumero: string
  onQR: () => void
  onCodigos: () => void
  onVolver: () => void
}

export default function FlujoPensionista({ mesaNumero, onQR, onCodigos, onVolver }: FlujoPensionistaProps) {
  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ backgroundColor: 'var(--pos-bg)' }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--pos-border)', backgroundColor: 'var(--pos-card)' }}>
        <button
          onClick={onVolver}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-[0.95]"
          style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>
          {mesaNumero === 'Para llevar' ? '🛍️ Para llevar' : `Mesa ${mesaNumero}`} · Pensionista
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-sm mb-4" style={{ color: 'var(--pos-text-muted)' }}>
          ¿Cómo deseas identificar al pensionista?
        </p>

        <button
          onClick={onQR}
          className="w-full max-w-xs h-20 rounded-2xl text-white font-semibold flex items-center justify-center gap-3 shadow-lg transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--pos-primary), var(--pos-secondary))' }}
        >
          <QrCode size={24} />
          Escanear QR
        </button>

        <button
          onClick={onCodigos}
          className="w-full max-w-xs h-20 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.98]"
          style={{ border: '2px solid var(--pos-primary)', color: 'var(--pos-primary)' }}
        >
          <Keyboard size={24} />
          Ingresar código(s)
        </button>
      </div>
    </div>
  )
}
