'use client'

import { useState } from 'react'
import { X, DollarSign, QrCode, ArrowRight } from 'lucide-react'
import type { Pedido, MetodoPago } from '../../lib/types'
import { formatearPrecio, calcularVuelto } from '../../lib/utils'

interface ModalPagoProps {
  pedido: Pedido
  open: boolean
  onClose: () => void
  onPagado: () => void
}

export default function ModalPago({ pedido, open, onClose, onPagado }: ModalPagoProps) {
  const [metodo, setMetodo] = useState<MetodoPago | null>(null)
  const [montoRecibido, setMontoRecibido] = useState('')

  if (!open) return null

  const monto = parseFloat(montoRecibido) || 0
  const vuelto = calcularVuelto(pedido.total, monto)
  const suficiente = monto >= pedido.total

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--pos-overlay)' }} />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl animate-slide-up shadow-2xl" style={{ backgroundColor: 'var(--pos-card)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--pos-border)' }}>
          <div>
            <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>Pagar pedido</h2>
            <p className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>Total: {formatearPrecio(pedido.total)}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: 'var(--pos-text-muted)' }}><X size={20} /></button>
        </div>

        {!metodo ? (
          <div className="p-5 space-y-3">
            <button
              onClick={() => setMetodo('efectivo')}
              className="w-full h-16 rounded-2xl text-white font-semibold flex items-center justify-center gap-3 text-base transition-all active:scale-[0.98] shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--pos-success), #4a7a5e)' }}
            >
              <DollarSign size={20} /> Efectivo
            </button>
            <button
              onClick={() => setMetodo('yape')}
              className="w-full h-16 rounded-2xl text-white font-semibold flex items-center justify-center gap-3 text-base transition-all active:scale-[0.98] shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--pos-primary), var(--pos-secondary))' }}
            >
              <QrCode size={20} /> Yape
            </button>
          </div>
        ) : metodo === 'efectivo' ? (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--pos-text-muted)' }}>Monto recibido</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--pos-text-muted)' }}>S/</span>
                <input
                  type="number"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  className="w-full h-14 pl-10 pr-4 rounded-xl text-lg font-bold outline-none"
                  style={{ backgroundColor: 'var(--pos-bg)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }}
                />
              </div>
            </div>
            {monto > 0 && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: suficiente ? 'var(--pos-success-bg)' : 'var(--pos-danger-bg)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>Vuelto</span>
                  <span className="text-xl font-bold" style={{ color: suficiente ? 'var(--pos-success)' : 'var(--pos-danger)' }}>
                    {suficiente ? formatearPrecio(vuelto) : 'Insuficiente'}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={onPagado}
              disabled={!suficiente}
              className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--pos-success)' }}
            >
              Confirmar pago <ArrowRight size={16} />
            </button>
            <button onClick={() => setMetodo(null)} className="w-full h-10 text-sm" style={{ color: 'var(--pos-text-muted)' }}>← Cambiar método</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--pos-bg)', border: '2px dashed var(--pos-border)' }}>
                {/* QR mock using SVG */}
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ color: 'var(--pos-primary)' }}>
                  <rect x="10" y="10" width="30" height="30" rx="4" fill="currentColor" opacity="0.8" />
                  <rect x="80" y="10" width="30" height="30" rx="4" fill="currentColor" opacity="0.8" />
                  <rect x="10" y="80" width="30" height="30" rx="4" fill="currentColor" opacity="0.8" />
                  <rect x="50" y="50" width="20" height="20" rx="3" fill="currentColor" opacity="0.6" />
                  <rect x="15" y="15" width="10" height="10" rx="2" fill="white" />
                  <rect x="85" y="15" width="10" height="10" rx="2" fill="white" />
                  <rect x="15" y="85" width="10" height="10" rx="2" fill="white" />
                  <rect x="45" y="10" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
                  <rect x="55" y="18" width="6" height="6" rx="1" fill="currentColor" opacity="0.3" />
                  <rect x="45" y="30" width="10" height="6" rx="1" fill="currentColor" opacity="0.35" />
                  <rect x="70" y="45" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
                  <rect x="85" y="55" width="12" height="6" rx="1" fill="currentColor" opacity="0.3" />
                  <rect x="85" y="75" width="8" height="10" rx="1" fill="currentColor" opacity="0.35" />
                  <rect x="55" y="85" width="10" height="8" rx="1" fill="currentColor" opacity="0.4" />
                  <rect x="75" y="95" width="8" height="6" rx="1" fill="currentColor" opacity="0.3" />
                  <text x="60" y="115" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">YAPE</text>
                </svg>
              </div>
              <p className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>
                Escanea para pagar <span className="font-bold" style={{ color: 'var(--pos-primary)' }}>{formatearPrecio(pedido.total)}</span>
              </p>
            </div>
            <button
              onClick={onPagado}
              className="w-full h-12 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'var(--pos-primary)' }}
            >
              ✅ Pago recibido
            </button>
            <button onClick={() => setMetodo(null)} className="w-full h-10 text-sm" style={{ color: 'var(--pos-text-muted)' }}>← Cambiar método</button>
          </div>
        )}
      </div>
    </div>
  )
}
