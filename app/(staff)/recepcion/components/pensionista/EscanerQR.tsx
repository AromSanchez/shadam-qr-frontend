'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Scan, Loader2, CheckCircle, AlertTriangle, Hash, Wallet, RotateCcw, ArrowRight, User } from 'lucide-react'
import type { Pensionista, ModoPension } from '../../lib/types'
import { pensionistasMock } from '../../lib/mock-data'
import { formatearPrecio } from '../../lib/utils'

interface EscanerQRProps {
  modo: ModoPension
  onEscaneado: (pensionista: Pensionista) => void
  onVolver: () => void
}

export default function EscanerQR({ modo, onEscaneado, onVolver }: EscanerQRProps) {
  const [escaneando, setEscaneando] = useState(false)
  const [resultado, setResultado] = useState<Pensionista | null>(null)

  const simular = useCallback(() => {
    setEscaneando(true)
    setTimeout(() => {
      const conSaldo = pensionistasMock.filter((p) => p.saldo > 0)
      const pool = conSaldo.length > 0 ? conSaldo : pensionistasMock
      const random = pool[Math.floor(Math.random() * pool.length)]
      setResultado({ ...random, pedidoConfirmado: false, itemsPedido: [], extras: [] })
      setEscaneando(false)
    }, 1200)
  }, [])

  const handleVolver = () => {
    setResultado(null)
    setEscaneando(false)
  }

  const tipoLabel = resultado?.tipo === 'escolar' ? 'Escolar' : 'Externo'
  const tieneSaldo = resultado && resultado.saldo > 0

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
            Escanear QR
          </h2>
          <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
            Apunta la cámara al carnet digital
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto">
        {!resultado ? (
          <>
            {/* Scanner frame */}
            <div className="relative w-60 h-60 flex items-center justify-center">
              {/* Outer glow when scanning */}
              {escaneando && (
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: '0 0 32px var(--pos-primary-glow)',
                    borderRadius: 'var(--pos-radius-lg)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              )}

              {/* Frame background */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: escaneando
                    ? 'rgba(6, 182, 212, 0.06)'
                    : 'rgba(6, 182, 212, 0.04)',
                  borderRadius: 'var(--pos-radius-lg)',
                  border: '1px solid rgba(6, 182, 212, 0.15)',
                }}
              >
                {/* Scanline */}
                {escaneando && (
                  <div
                    className="absolute left-0 w-full h-0.5 animate-scanline"
                    style={{
                      background: 'linear-gradient(to right, transparent, var(--pos-primary), transparent)',
                    }}
                  />
                )}
              </div>

              {/* Corner brackets — top-left */}
              <div
                className="absolute top-0 left-0 w-8 h-8"
                style={{
                  borderTop: '3px solid var(--pos-primary)',
                  borderLeft: '3px solid var(--pos-primary)',
                  borderRadius: '4px 0 0 0',
                }}
              />
              {/* top-right */}
              <div
                className="absolute top-0 right-0 w-8 h-8"
                style={{
                  borderTop: '3px solid var(--pos-primary)',
                  borderRight: '3px solid var(--pos-primary)',
                  borderRadius: '0 4px 0 0',
                }}
              />
              {/* bottom-left */}
              <div
                className="absolute bottom-0 left-0 w-8 h-8"
                style={{
                  borderBottom: '3px solid var(--pos-primary)',
                  borderLeft: '3px solid var(--pos-primary)',
                  borderRadius: '0 0 0 4px',
                }}
              />
              {/* bottom-right */}
              <div
                className="absolute bottom-0 right-0 w-8 h-8"
                style={{
                  borderBottom: '3px solid var(--pos-primary)',
                  borderRight: '3px solid var(--pos-primary)',
                  borderRadius: '0 0 4px 0',
                }}
              />

              {/* Center content */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                {escaneando ? (
                  <Loader2
                    size={44}
                    className="animate-spin"
                    style={{ color: 'var(--pos-primary)' }}
                  />
                ) : (
                  <>
                    <Scan
                      size={44}
                      style={{ color: 'var(--pos-primary)', opacity: 0.45 }}
                    />
                    <span
                      className="text-xs font-medium tracking-wide"
                      style={{ color: 'var(--pos-text-muted)' }}
                    >
                      Cámara lista
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Hint text */}
            {!escaneando && (
              <p
                className="text-xs text-center max-w-[200px]"
                style={{ color: 'var(--pos-text-muted)' }}
              >
                Acerca el carnet QR al encuadre para identificar al pensionista
              </p>
            )}

            {/* Simulate button */}
            <button
              onClick={simular}
              disabled={escaneando}
              className="pos-btn pos-btn-primary w-full max-w-xs h-12 rounded-xl font-heading font-semibold text-sm tracking-wide shadow-md transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
              style={{ boxShadow: escaneando ? 'none' : 'var(--pos-shadow-cyan)' }}
            >
              {escaneando ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Escaneando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Scan size={16} />
                  Simular escaneo
                </span>
              )}
            </button>
          </>
        ) : (
          /* Result card */
          <div
            className="w-full max-w-sm rounded-[20px] overflow-hidden animate-slide-up"
            style={{
              border: '1px solid var(--pos-border)',
              boxShadow: 'var(--pos-shadow-lg)',
              backgroundColor: 'var(--pos-card)',
            }}
          >
            {/* Gradient header */}
            <div
              className="px-6 py-5 flex items-center gap-4"
              style={{
                background: tieneSaldo
                  ? 'linear-gradient(135deg, #0891b2 0%, #06B6D4 60%, #22d3ee 100%)'
                  : 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
              }}
            >
              {/* Avatar circle with initials */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white font-heading font-bold text-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              >
                {resultado.nombre
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-heading font-bold text-base leading-tight truncate">
                  {resultado.nombre}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.95)' }}
                  >
                    {tipoLabel}
                  </span>
                  {tieneSaldo && (
                    <CheckCircle size={14} className="text-white opacity-80" />
                  )}
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div className="px-5 py-4 space-y-3" style={{ backgroundColor: 'var(--pos-card)' }}>
              {/* Codigo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ color: 'var(--pos-text-muted)' }}>
                  <Hash size={14} />
                  <span className="text-sm">Código</span>
                </div>
                <span
                  className="text-sm font-mono font-bold tracking-wider"
                  style={{ color: 'var(--pos-text)' }}
                >
                  {resultado.codigo}
                </span>
              </div>

              <div
                className="h-px"
                style={{ backgroundColor: 'var(--pos-divider)' }}
              />

              {/* Saldo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ color: 'var(--pos-text-muted)' }}>
                  <Wallet size={14} />
                  <span className="text-sm">Saldo</span>
                </div>
                <span
                  className="text-sm font-bold text-tabular"
                  style={{ color: tieneSaldo ? 'var(--pos-success)' : 'var(--pos-danger)' }}
                >
                  {formatearPrecio(resultado.saldo)}
                </span>
              </div>

              {/* Zero-saldo warning */}
              {resultado.saldo === 0 && (
                <div
                  className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--pos-danger-bg)',
                    border: '1px solid var(--pos-danger-border)',
                  }}
                >
                  <AlertTriangle
                    size={15}
                    className="shrink-0 mt-px"
                    style={{ color: 'var(--pos-danger)' }}
                  />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-danger)' }}>
                    Este pensionista no tiene saldo disponible. Puede continuar igualmente.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className="px-4 pb-5 pt-3 flex flex-col gap-2.5"
              style={{ borderTop: '1px solid var(--pos-border)' }}
            >
              <button
                onClick={() => onEscaneado(resultado)}
                className="pos-btn pos-btn-primary w-full h-12 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97]"
                style={{ boxShadow: 'var(--pos-shadow-cyan)' }}
              >
                Continuar
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleVolver}
                className="pos-btn pos-btn-ghost w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97]"
              >
                <RotateCcw size={15} />
                Volver a escanear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
