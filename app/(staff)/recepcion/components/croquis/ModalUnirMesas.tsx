'use client'

import { useState } from 'react'
import { X, Link2 } from 'lucide-react'
import type { Mesa } from '../../lib/types'

interface ModalUnirMesasProps {
  mesaPrincipal: Mesa
  mesasDisponibles: Mesa[]
  open: boolean
  onClose: () => void
  onConfirmar: (idsMesas: string[]) => void
}

export default function ModalUnirMesas({ mesaPrincipal, mesasDisponibles, open, onClose, onConfirmar }: ModalUnirMesasProps) {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([])
  const [confirmando, setConfirmando] = useState(false)

  if (!open) return null

  // Max additional mesas: 3 total - 1 (principal) - existing merged
  const maxAdicionales = 3 - 1 - (mesaPrincipal.unidaCon?.length || 0)

  const toggle = (id: string) => {
    setSeleccionadas((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= maxAdicionales) return prev
      return [...prev, id]
    })
  }

  const nombres = seleccionadas
    .map((id) => mesasDisponibles.find((m) => m.id === id))
    .filter(Boolean)
    .map((m) => `Mesa ${m!.numero}`)
    .join(' y ')

  const tienePedido = seleccionadas.some((id) => {
    const m = mesasDisponibles.find((x) => x.id === id)
    return m?.estado === 'ocupado'
  })

  const handleConfirmar = () => {
    if (tienePedido && !confirmando) {
      setConfirmando(true)
      return
    }
    onConfirmar(seleccionadas)
    setSeleccionadas([])
    setConfirmando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--pos-overlay)' }} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[calc(100%-1.5rem)] sm:w-full sm:max-w-md animate-slide-up shadow-2xl mx-auto mb-4 sm:mb-0"
        style={{
          backgroundColor: 'var(--pos-card)',
          borderRadius: 'var(--pos-radius-2xl)',
        }}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--pos-border)' }}>
          <div className="flex items-center gap-2">
            <Link2 size={18} style={{ color: 'var(--pos-primary)' }} />
            <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>
              Unir Mesa {mesaPrincipal.numero}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: 'var(--pos-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm mb-4" style={{ color: 'var(--pos-text-muted)' }}>
            Selecciona hasta {maxAdicionales} mesa{maxAdicionales > 1 ? 's' : ''} para unir:
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {mesasDisponibles.map((mesa) => {
              const selected = seleccionadas.includes(mesa.id)
              const disabled = !selected && seleccionadas.length >= maxAdicionales
              return (
                <button
                  key={mesa.id}
                  onClick={() => !disabled && toggle(mesa.id)}
                  className="h-16 rounded-xl font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-[0.98]"
                  style={{
                    border: `2px solid ${selected ? 'var(--pos-primary)' : 'var(--pos-border)'}`,
                    backgroundColor: selected ? 'rgba(192, 113, 74, 0.12)' : 'transparent',
                    color: disabled ? 'var(--pos-text-muted)' : 'var(--pos-text)',
                    opacity: disabled ? 0.4 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>{selected ? '✓ ' : ''}Mesa {mesa.numero}</span>
                  {mesa.estado === 'ocupado' && (
                    <span className="text-[10px] font-normal" style={{ color: 'var(--pos-warning)' }}>
                      Tiene pedido activo
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Confirmation message */}
          {confirmando && tienePedido && (
            <div className="p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: 'var(--pos-warning-bg)', color: 'var(--pos-warning)' }}>
              ⚠️ {nombres} tiene un pedido activo. ¿Deseas unirla con Mesa {mesaPrincipal.numero}? Ambos pedidos quedarán bajo la mesa principal.
            </div>
          )}

          {seleccionadas.length > 0 && !confirmando && (
            <p className="text-sm text-center mb-3" style={{ color: 'var(--pos-primary)' }}>
              ¿Unir Mesa {mesaPrincipal.numero} con {nombres}?
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { onClose(); setSeleccionadas([]); setConfirmando(false) }}
              className="flex-1 h-12 rounded-xl font-medium text-sm transition-all duration-150"
              style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text-muted)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={seleccionadas.length === 0}
              className="flex-1 h-12 rounded-xl text-white font-semibold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--pos-primary)' }}
            >
              Confirmar unión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
