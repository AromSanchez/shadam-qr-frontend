'use client'

import { useState, useEffect, useRef } from 'react'
import { X, DollarSign, QrCode, Smartphone, ArrowRight, ChevronLeft, Check } from 'lucide-react'
import type { Pedido, MetodoPago } from '../../lib/types'
import { formatearPrecio, calcularVuelto } from '../../lib/utils'

interface ModalPagoProps {
  pedido: Pedido
  open: boolean
  onClose: () => void
  // BUG FIX: pass selected payment method back to caller
  onPagado: (metodo: MetodoPago) => void
}

// Quick amount chips relative to the total
function getChips(total: number): number[] {
  const exact = Math.ceil(total)
  const chips = [exact]
  for (const bump of [10, 20, 50]) {
    const rounded = Math.ceil((total + bump) / 10) * 10
    if (!chips.includes(rounded)) chips.push(rounded)
  }
  return chips.slice(0, 4)
}

export default function ModalPago({ pedido, open, onClose, onPagado }: ModalPagoProps) {
  const [metodo, setMetodo] = useState<MetodoPago | null>(null)
  const [montoRecibido, setMontoRecibido] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when efectivo step appears
  useEffect(() => {
    if (metodo === 'efectivo') {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [metodo])



  if (!open) return null

  const monto = parseFloat(montoRecibido) || 0
  const vuelto = calcularVuelto(pedido.total, monto)
  const suficiente = monto >= pedido.total
  const chips = getChips(pedido.total)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'var(--pos-overlay)' }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-t-[24px] sm:rounded-[24px] animate-slide-up mb-20 sm:mb-0"
        style={{
          backgroundColor: 'var(--pos-card)',
          boxShadow: 'var(--pos-shadow-xl)',
          border: '1px solid var(--pos-border)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: '1px solid var(--pos-border)' }}
        >
          <div className="flex items-center gap-3">
            {metodo && (
              <button
                onClick={() => { setMetodo(null); setMontoRecibido('') }}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: 'var(--pos-text-muted)' }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h2
                className="font-heading text-base font-bold leading-tight"
                style={{ color: 'var(--pos-text)' }}
              >
                {metodo ? 'Confirmar pago' : 'Método de pago'}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--pos-text-muted)' }}>
                Pedido{' '}
                <span className="font-mono font-bold">#{pedido.numeroPedido}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Prominent total */}
            <div
              className="px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              <span
                className="font-heading text-base font-bold text-tabular"
                style={{ color: 'var(--pos-primary)' }}
              >
                {formatearPrecio(pedido.total)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ color: 'var(--pos-text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Step 1: Choose payment method ── */}
        {!metodo && (
          <div className="p-5 space-y-3">
            {/* Efectivo */}
            <button
              onClick={() => setMetodo('efectivo')}
              className="w-full h-[72px] rounded-[20px] font-heading font-semibold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.97] active:translate-y-px hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <DollarSign size={20} />
              </div>
              Efectivo
            </button>

            {/* Yape */}
            <button
              onClick={() => setMetodo('yape')}
              className="w-full h-[72px] rounded-[20px] font-heading font-semibold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.97] active:translate-y-px hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(167,139,250,0.28)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <QrCode size={20} />
              </div>
              Yape
            </button>
          </div>
        )}

        {/* ── Step 2a: Efectivo ── */}
        {metodo === 'efectivo' && (
          <div className="p-5 space-y-4">
            {/* Amount input */}
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider block mb-2"
                style={{ color: 'var(--pos-text-muted)' }}
              >
                Monto recibido
              </label>
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ border: '2px solid var(--pos-border-2)' }}
              >
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 font-heading font-bold text-xl"
                  style={{ color: 'var(--pos-text-muted)' }}
                >
                  S/
                </span>
                <input
                  ref={inputRef}
                  type="number"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  className="w-full h-16 pl-12 pr-4 bg-transparent outline-none font-heading text-3xl font-bold text-tabular"
                  style={{ color: 'var(--pos-text)', backgroundColor: 'var(--pos-surface-2)' }}
                />
              </div>
            </div>

            {/* Quick amount chips */}
            <div>
              <p
                className="text-[10px] uppercase tracking-wider mb-2 font-semibold"
                style={{ color: 'var(--pos-text-muted)' }}
              >
                Montos rápidos
              </p>
              <div className="flex gap-2 flex-wrap">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setMontoRecibido(String(chip))}
                    className="px-4 h-10 rounded-xl text-sm font-semibold font-heading transition-all active:scale-[0.97] hover:brightness-110"
                    style={{
                      backgroundColor: montoRecibido === String(chip)
                        ? 'var(--pos-primary)'
                        : 'var(--pos-surface-2)',
                      color: montoRecibido === String(chip)
                        ? '#fff'
                        : 'var(--pos-text)',
                      border: '1px solid var(--pos-border)',
                    }}
                  >
                    S/ {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Change display */}
            {monto > 0 && (
              <div
                className="p-4 rounded-xl transition-all"
                style={{
                  backgroundColor: suficiente ? 'var(--pos-success-bg)' : 'var(--pos-danger-bg)',
                  border: `1px solid ${suficiente ? 'var(--pos-success-border)' : 'var(--pos-danger-border)'}`,
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider font-semibold"
                      style={{ color: suficiente ? 'var(--pos-success)' : 'var(--pos-danger)' }}
                    >
                      {suficiente ? 'Vuelto' : 'Falta'}
                    </p>
                    <span
                      className="font-heading text-2xl font-bold text-tabular"
                      style={{ color: suficiente ? 'var(--pos-success)' : 'var(--pos-danger)' }}
                    >
                      {suficiente
                        ? formatearPrecio(vuelto)
                        : formatearPrecio(pedido.total - monto)}
                    </span>
                  </div>
                  {suficiente && (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--pos-success)', opacity: 0.9 }}
                    >
                      <Check size={18} color="#fff" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={() => onPagado('efectivo')}
              disabled={!suficiente}
              className="w-full h-14 rounded-xl text-white font-heading font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.97] active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--pos-success)' }}
            >
              Confirmar pago <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── Step 2b: Yape QR ── */}
        {metodo === 'yape' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col items-center py-2">
              {/* QR display */}
              <div
                className="w-52 h-52 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1e1032 0%, #2d1b69 100%)',
                  border: '2px solid rgba(167,139,250,0.3)',
                  boxShadow: '0 8px 32px rgba(167,139,250,0.2)',
                }}
              >
                {/* Decorative scanline */}
                <div className="animate-scanline absolute inset-x-0 h-0.5 opacity-40"
                  style={{ backgroundColor: '#A78BFA' }} />
                <svg width="148" height="148" viewBox="0 0 120 120">
                  {/* Corner squares */}
                  <rect x="8" y="8" width="30" height="30" rx="4" fill="#A78BFA" opacity="0.9" />
                  <rect x="82" y="8" width="30" height="30" rx="4" fill="#A78BFA" opacity="0.9" />
                  <rect x="8" y="82" width="30" height="30" rx="4" fill="#A78BFA" opacity="0.9" />
                  {/* Corner inners */}
                  <rect x="13" y="13" width="10" height="10" rx="2" fill="#fff" opacity="0.95" />
                  <rect x="87" y="13" width="10" height="10" rx="2" fill="#fff" opacity="0.95" />
                  <rect x="13" y="87" width="10" height="10" rx="2" fill="#fff" opacity="0.95" />
                  {/* Data dots */}
                  <rect x="46" y="8" width="6" height="6" rx="1" fill="#A78BFA" opacity="0.5" />
                  <rect x="54" y="16" width="4" height="4" rx="1" fill="#A78BFA" opacity="0.4" />
                  <rect x="44" y="26" width="8" height="5" rx="1" fill="#A78BFA" opacity="0.45" />
                  <rect x="58" y="8" width="5" height="9" rx="1" fill="#A78BFA" opacity="0.35" />
                  <rect x="68" y="46" width="6" height="6" rx="1" fill="#A78BFA" opacity="0.5" />
                  <rect x="82" y="54" width="10" height="5" rx="1" fill="#A78BFA" opacity="0.4" />
                  <rect x="86" y="76" width="6" height="8" rx="1" fill="#A78BFA" opacity="0.45" />
                  <rect x="54" y="82" width="8" height="7" rx="1" fill="#A78BFA" opacity="0.5" />
                  <rect x="76" y="92" width="6" height="5" rx="1" fill="#A78BFA" opacity="0.35" />
                  <rect x="44" y="46" width="20" height="20" rx="3" fill="#A78BFA" opacity="0.5" />
                  <rect x="47" y="49" width="6" height="6" rx="1" fill="#fff" opacity="0.7" />
                  <rect x="55" y="49" width="6" height="6" rx="1" fill="#A78BFA" opacity="0.8" />
                  <rect x="47" y="57" width="6" height="6" rx="1" fill="#A78BFA" opacity="0.8" />
                  <rect x="55" y="57" width="6" height="6" rx="1" fill="#fff" opacity="0.7" />
                  {/* Label */}
                  <text x="60" y="113" textAnchor="middle" fontSize="7" fill="#A78BFA" opacity="0.7" fontWeight="bold">YAPE</text>
                </svg>
              </div>

              <p className="text-sm font-medium" style={{ color: 'var(--pos-text-muted)' }}>
                Escanea el código para pagar
              </p>
              <p
                className="font-heading text-2xl font-bold text-tabular mt-1"
                style={{ color: '#A78BFA' }}
              >
                {formatearPrecio(pedido.total)}
              </p>
            </div>

            {/* Confirm received */}
            <button
              onClick={() => onPagado('yape')}
              className="w-full h-14 rounded-xl text-white font-heading font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.97] active:translate-y-px"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                boxShadow: '0 4px 20px rgba(167,139,250,0.3)',
              }}
            >
              <Check size={18} strokeWidth={2.5} />
              Pago recibido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
