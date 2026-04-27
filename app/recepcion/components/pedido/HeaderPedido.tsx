'use client'

import { ArrowLeft } from 'lucide-react'
import type { ModoPension, TipoCliente } from '../../lib/types'
import { labelModo, iconoModo, formatearPrecio } from '../../lib/utils'

interface HeaderPedidoProps {
  mesaNumero: string
  modo: ModoPension
  tipoCliente: TipoCliente
  nombreCliente?: string
  tipoP?: string
  saldo?: number
  onVolver: () => void
}

export default function HeaderPedido({ mesaNumero, modo, tipoCliente, nombreCliente, tipoP, saldo, onVolver }: HeaderPedidoProps) {
  const tipoLabel = tipoCliente === 'regular' ? 'Cliente regular' : 'Pensionista'

  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 shadow-sm"
      style={{ backgroundColor: 'var(--pos-card)', borderBottom: '1px solid var(--pos-border)' }}
    >
      <button
        onClick={onVolver}
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-[0.95]"
        style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }}
      >
        <ArrowLeft size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-heading text-base font-bold" style={{ color: 'var(--pos-text)' }}>
            {mesaNumero === 'Para llevar' ? '🛍️ Para llevar' : `Mesa ${mesaNumero}`}
          </h2>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-lg"
            style={{ backgroundColor: 'rgba(192, 113, 74, 0.12)', color: 'var(--pos-primary)' }}
          >
            {iconoModo(modo)} {labelModo(modo)}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-lg"
            style={{ backgroundColor: 'rgba(212, 149, 106, 0.12)', color: 'var(--pos-secondary)' }}
          >
            {tipoLabel}
          </span>
        </div>
        {nombreCliente && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--pos-text-muted)' }}>
            {nombreCliente} · {tipoP} · Saldo: {formatearPrecio(saldo ?? 0)}
          </p>
        )}
      </div>
    </div>
  )
}
