'use client'

import { ArrowLeft, Wallet } from 'lucide-react'
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

export default function HeaderPedido({
  mesaNumero,
  modo,
  tipoCliente,
  nombreCliente,
  tipoP,
  saldo,
  onVolver,
}: HeaderPedidoProps) {
  const esPensionista = tipoCliente !== 'regular'
  const saldoBajo = esPensionista && saldo !== undefined && saldo < 10

  /* Map modo → badge class */
  const modoBadgeClass =
    modo === 'desayuno' ? 'badge-desayuno'
    : modo === 'almuerzo' ? 'badge-almuerzo'
    : modo === 'cena' ? 'badge-cena'
    : 'badge-modo'

  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-3 px-4 animate-fade-in"
      style={{
        minHeight: '56px',
        backgroundColor: 'var(--pos-surface)',
        borderBottom: '1px solid var(--pos-border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      }}
    >
      {/* ── Back button ── */}
      <button
        onClick={onVolver}
        className="touch-target shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-[0.93]"
        style={{
          backgroundColor: 'var(--pos-surface-2)',
          border: '1px solid var(--pos-border)',
          color: 'var(--pos-text)',
        }}
        aria-label="Volver"
      >
        <ArrowLeft size={18} />
      </button>

      {/* ── Center: mesa + modo ── */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 flex-wrap">
          <h2
            className="font-heading text-base font-bold tracking-tight"
            style={{ color: 'var(--pos-text)' }}
          >
            {mesaNumero === 'Para llevar' ? 'Para llevar' : `Mesa ${mesaNumero}`}
          </h2>

          {/* Modo badge */}
          <span className={`${modoBadgeClass} text-xs font-semibold font-heading px-2 py-0.5 rounded-lg`}>
            {iconoModo(modo)} {labelModo(modo)}
          </span>

          {/* Cliente type label when NOT pensionista */}
          {!esPensionista && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: 'var(--pos-surface-2)', color: 'var(--pos-text-muted)' }}
            >
              Regular
            </span>
          )}
        </div>
      </div>

      {/* ── Right: pensionista chip ── */}
      {esPensionista && nombreCliente && (
        <div
          className="shrink-0 flex flex-col items-end gap-0.5"
        >
          {/* Name chip */}
          <span
            className="text-xs font-semibold font-heading px-2.5 py-1 rounded-xl truncate max-w-[140px]"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--pos-primary) 12%, transparent)',
              color: 'var(--pos-primary)',
              border: '1px solid color-mix(in srgb, var(--pos-primary) 25%, transparent)',
            }}
          >
            {nombreCliente}
          </span>

          {/* Balance */}
          {saldo !== undefined && (
            <div className="flex items-center gap-1">
              <Wallet size={11} style={{ color: saldoBajo ? 'var(--pos-danger)' : 'var(--pos-success)' }} />
              <span
                className="text-[11px] font-semibold tabular-nums"
                style={{ color: saldoBajo ? 'var(--pos-danger)' : 'var(--pos-success)' }}
              >
                {formatearPrecio(saldo)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
