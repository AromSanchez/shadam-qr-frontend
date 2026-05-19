'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { labelModo } from '../../lib/utils'
import type { ModoPension } from '../../lib/types'

interface PantallaExitoProps {
  mesaNumero: string
  modo: ModoPension
  itemsCount: number
  esPensionista: boolean
  onEscanearSiguiente: () => void
  onNuevoPedido: () => void
}

export default function PantallaExito({ mesaNumero, modo, itemsCount, esPensionista, onEscanearSiguiente, onNuevoPedido }: PantallaExitoProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const dur = 3000
    const raf = () => {
      const elapsed = Date.now() - start
      setProgress(Math.min(elapsed / dur, 1))
      if (elapsed < dur) requestAnimationFrame(raf)
      else onNuevoPedido()
    }
    requestAnimationFrame(raf)
  }, [onNuevoPedido])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--pos-overlay)' }}>
      <div className="rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl animate-slide-up" style={{ backgroundColor: 'var(--pos-card)' }}>
        <div className="flex justify-center mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-success"
            style={{ backgroundColor: 'var(--pos-success-bg)' }}
          >
            <CheckCircle size={44} style={{ color: 'var(--pos-success)' }} strokeWidth={2.5} />
          </div>
        </div>

        <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--pos-text)' }}>
          ¡Pedido registrado!
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--pos-text-muted)' }}>
          {mesaNumero === 'Para llevar' ? '🛍️ Para llevar' : `Mesa ${mesaNumero}`} · {labelModo(modo)} · {itemsCount} ítem{itemsCount > 1 ? 's' : ''}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-6 overflow-hidden" style={{ backgroundColor: 'var(--pos-border)' }}>
          <div className="h-full rounded-full transition-none" style={{ width: `${progress * 100}%`, backgroundColor: 'var(--pos-success)' }} />
        </div>

        <div className="flex gap-3">
          {esPensionista && (
            <button
              onClick={onEscanearSiguiente}
              className="flex-1 h-12 rounded-xl text-white font-semibold text-sm transition-all duration-150 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--pos-primary)' }}
            >
              📷 Escanear siguiente
            </button>
          )}
          <button
            onClick={onNuevoPedido}
            className="flex-1 h-12 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98]"
            style={{ border: '2px solid var(--pos-primary)', color: 'var(--pos-primary)' }}
          >
            + Nuevo pedido
          </button>
        </div>
      </div>
    </div>
  )
}
