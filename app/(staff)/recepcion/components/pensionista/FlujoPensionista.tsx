'use client'

import { QrCode, Keyboard, ArrowLeft, ChevronRight, ShoppingBag } from 'lucide-react'

interface FlujoPensionistaProps {
  mesaNumero: string
  onQR: () => void
  onCodigos: () => void
  onVolver: () => void
}

export default function FlujoPensionista({ mesaNumero, onQR, onCodigos, onVolver }: FlujoPensionistaProps) {
  const esPararLlevar = mesaNumero === 'Para llevar'

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ backgroundColor: 'var(--pos-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--pos-border)',
          backgroundColor: 'var(--pos-card)',
          boxShadow: 'var(--pos-shadow-sm)',
        }}
      >
        <button
          onClick={onVolver}
          className="touch-target w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 hover:opacity-75 active:scale-[0.95]"
          style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text-2)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-heading text-base font-bold leading-tight" style={{ color: 'var(--pos-text)' }}>
            Pensionista
          </h2>
          <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
            {esPararLlevar ? 'Para llevar' : `Mesa ${mesaNumero}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center p-6 gap-4">
        <div className="mb-2">
          <h3
            className="font-heading text-sm font-semibold mb-1"
            style={{ color: 'var(--pos-text)' }}
          >
            Identificar pensionista
          </h3>
          <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
            Selecciona el método de identificación
          </p>
        </div>

        {/* Option card: Scan QR */}
        <button
          onClick={onQR}
          className="group w-full rounded-2xl p-5 flex items-center gap-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
          style={{
            backgroundColor: 'var(--pos-card)',
            border: '1px solid var(--pos-border)',
            minHeight: '100px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--pos-primary)'
            e.currentTarget.style.boxShadow = 'var(--pos-shadow-cyan)'
            e.currentTarget.style.backgroundColor = 'var(--pos-primary-dim)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--pos-border)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.backgroundColor = 'var(--pos-card)'
          }}
        >
          {/* Icon container */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
            style={{
              backgroundColor: 'var(--pos-primary-dim)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
            }}
          >
            <QrCode size={26} style={{ color: 'var(--pos-primary)' }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p
              className="font-heading font-semibold text-sm mb-0.5"
              style={{ color: 'var(--pos-text)' }}
            >
              Escanear QR
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-text-muted)' }}>
              Para clientes con carnet digital
            </p>
          </div>

          <ChevronRight
            size={18}
            style={{ color: 'var(--pos-text-muted)', flexShrink: 0 }}
          />
        </button>

        {/* Option card: Enter code */}
        <button
          onClick={onCodigos}
          className="group w-full rounded-2xl p-5 flex items-center gap-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
          style={{
            backgroundColor: 'var(--pos-card)',
            border: '1px solid var(--pos-border)',
            minHeight: '100px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--pos-primary)'
            e.currentTarget.style.boxShadow = 'var(--pos-shadow-cyan)'
            e.currentTarget.style.backgroundColor = 'var(--pos-primary-dim)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--pos-border)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.backgroundColor = 'var(--pos-card)'
          }}
        >
          {/* Icon container */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
            style={{
              backgroundColor: 'rgba(167, 139, 250, 0.12)',
              border: '1px solid rgba(167, 139, 250, 0.25)',
            }}
          >
            <Keyboard size={26} style={{ color: 'var(--pos-pay-yape)' }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p
              className="font-heading font-semibold text-sm mb-0.5"
              style={{ color: 'var(--pos-text)' }}
            >
              Ingresar código
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-text-muted)' }}>
              Para ingresar manualmente
            </p>
          </div>

          <ChevronRight
            size={18}
            style={{ color: 'var(--pos-text-muted)', flexShrink: 0 }}
          />
        </button>
      </div>
    </div>
  )
}
