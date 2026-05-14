'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Scan, User, Loader2 } from 'lucide-react'
import type { Pensionista, ModoPension } from '../../lib/types'
import { pensionistasMock } from '../../lib/mock-data'
import { labelModo, iconoModo, formatearPrecio } from '../../lib/utils'

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
      // Prefer one with balance
      const conSaldo = pensionistasMock.filter((p) => p.saldo > 0)
      const pool = conSaldo.length > 0 ? conSaldo : pensionistasMock
      const random = pool[Math.floor(Math.random() * pool.length)]
      setResultado({ ...random, pedidoConfirmado: false, itemsPedido: [], extras: [] })
      setEscaneando(false)
    }, 1200)
  }, [])

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ backgroundColor: 'var(--pos-bg)' }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--pos-border)', backgroundColor: 'var(--pos-card)' }}>
        <button onClick={onVolver} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>Escanear QR</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {!resultado ? (
          <>
            {/* Scanner frame */}
            <div
              className="relative w-56 h-56 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ border: '4px dashed var(--pos-primary)', opacity: 0.8, backgroundColor: 'rgba(192, 113, 74, 0.12)' }}
            >
              {escaneando ? (
                <>
                  {/* Animated scanline */}
                  <div className="absolute left-0 w-full h-0.5 animate-scanline" style={{ backgroundColor: 'var(--pos-primary)' }} />
                  <Loader2 size={40} className="animate-spin" style={{ color: 'var(--pos-primary)' }} />
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Scan size={48} style={{ color: 'var(--pos-primary)', opacity: 0.5 }} />
                  <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Cámara lista</span>
                </div>
              )}
              {/* Corner brackets */}
              {['top-0 left-0 border-t-4 border-l-4 rounded-tl-lg', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg'].map((cls, i) => (
                <div key={i} className={`absolute w-6 h-6 ${cls}`} style={{ borderColor: 'var(--pos-primary)' }} />
              ))}
            </div>

            <button
              onClick={simular}
              disabled={escaneando}
              className="h-12 px-8 rounded-xl text-white font-semibold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: 'var(--pos-primary)' }}
            >
              {escaneando ? 'Escaneando...' : '⚡ Simular escaneo'}
            </button>
          </>
        ) : (
          /* Result card */
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg animate-slide-up" style={{ border: '1px solid var(--pos-border)' }}>
            <div className="p-6 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, var(--pos-primary), var(--pos-secondary))' }}>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{resultado.nombre}</h3>
                <span className="text-white/80 text-sm capitalize">{resultado.tipo}</span>
              </div>
            </div>
            <div className="p-5 space-y-3" style={{ backgroundColor: 'var(--pos-card)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--pos-text-muted)' }}>Código</span>
                <span className="font-mono font-bold" style={{ color: 'var(--pos-text)' }}>{resultado.codigo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--pos-text-muted)' }}>Saldo</span>
                <span className="font-bold" style={{ color: resultado.saldo > 0 ? 'var(--pos-success)' : 'var(--pos-danger)' }}>
                  {formatearPrecio(resultado.saldo)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--pos-text-muted)' }}>Modo actual</span>
                <span className="font-medium" style={{ color: 'var(--pos-primary)' }}>{iconoModo(modo)} {labelModo(modo)}</span>
              </div>
              {resultado.saldo === 0 && (
                <p className="text-xs px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--pos-danger-bg)', color: 'var(--pos-danger)' }}>
                  ⚠️ Este pensionista tiene saldo S/ 0.00
                </p>
              )}
            </div>
            <div className="p-4" style={{ borderTop: '1px solid var(--pos-border)', backgroundColor: 'var(--pos-card)' }}>
              <button
                onClick={() => onEscaneado(resultado)}
                className="w-full h-12 rounded-xl text-white font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--pos-success)' }}
              >
                Continuar con este pedido →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
