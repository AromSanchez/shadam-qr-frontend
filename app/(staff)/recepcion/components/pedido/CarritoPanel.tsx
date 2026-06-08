'use client'

import { X, Trash2, Package, ChevronDown, ChevronUp, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import type { ItemPedido, Extra, TipoCliente } from '../../lib/types'
import { formatearPrecio } from '../../lib/utils'

interface CarritoPanelProps {
  items: ItemPedido[]
  extras: Extra[]
  tipoCliente: TipoCliente
  saldoPensionista?: number
  confirmLabel?: string
  disabled?: boolean
  onQuitarItem: (itemId: string) => void
  onToggleParaLlevar: (itemId: string) => void
  onCancelar: () => void
  onConfirmar: () => void
}

export default function CarritoPanel({
  items,
  extras,
  tipoCliente,
  saldoPensionista,
  confirmLabel,
  disabled,
  onQuitarItem,
  onToggleParaLlevar,
  onCancelar,
  onConfirmar,
}: CarritoPanelProps) {
  const [expandido, setExpandido] = useState(false)

  const esPensionista = tipoCliente !== 'regular'
  const precio = (item: ItemPedido) =>
    (esPensionista ? item.producto.precioPension : item.producto.precioRegular) * item.cantidad

  const subtotalProductos = items.reduce((s, i) => s + precio(i), 0)
  const subtotalExtras = extras.reduce((s, e) => s + e.monto, 0)
  const total = subtotalProductos + subtotalExtras

  const saldoInsuficiente = esPensionista && saldoPensionista !== undefined && total > saldoPensionista
  const saldoTras = esPensionista && saldoPensionista !== undefined ? saldoPensionista - total : null
  const totalItems = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div
      className="sticky bottom-0 sm:relative z-10 pos-glass animate-slide-up"
      style={{
        borderTop: '1px solid var(--pos-border)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.28)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* ── Mobile collapse toggle ── */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="sm:hidden w-full flex items-center justify-between px-4 py-3.5 transition-colors duration-150"
        style={{ borderBottom: expandido ? '1px solid var(--pos-divider)' : 'none' }}
      >
        {/* Left: cart icon + count pill */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'color-mix(in srgb, var(--pos-primary) 15%, transparent)' }}
          >
            <ShoppingCart size={16} style={{ color: 'var(--pos-primary)' }} />
          </div>
          <span className="font-heading text-sm font-bold" style={{ color: 'var(--pos-text)' }}>
            Carrito
          </span>
          {totalItems > 0 && (
            <span
              className="min-w-[20px] h-5 rounded-full text-[11px] font-bold font-heading flex items-center justify-center px-1.5"
              style={{ backgroundColor: 'var(--pos-primary)', color: '#fff' }}
            >
              {totalItems}
            </span>
          )}
        </div>

        {/* Right: total + chevron */}
        <div className="flex items-center gap-2">
          <span
            className="font-heading text-base font-bold tabular-nums"
            style={{ color: 'var(--pos-primary)' }}
          >
            {formatearPrecio(total)}
          </span>
          {expandido
            ? <ChevronDown size={18} style={{ color: 'var(--pos-text-muted)' }} />
            : <ChevronUp size={18} style={{ color: 'var(--pos-text-muted)' }} />
          }
        </div>
      </button>

      {/* ── Items list (always on desktop, toggle on mobile) ── */}
      <div className={`${expandido ? 'block' : 'hidden'} sm:block`}>
        <div className="max-h-52 overflow-y-auto pos-scrollbar px-4 py-2 space-y-0.5">

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <ShoppingCart size={28} style={{ color: 'var(--pos-text-disabled)' }} />
              <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
                El carrito está vacío
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 py-2 rounded-xl px-2 transition-colors duration-100"
                style={{ borderBottom: '1px solid var(--pos-divider)' }}
              >
                {/* Quantity bubble */}
                <span
                  className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold font-heading tabular-nums"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--pos-primary) 12%, transparent)', color: 'var(--pos-primary)' }}
                >
                  {item.cantidad}
                </span>

                {/* Name + para-llevar badge */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span
                    className="text-sm truncate"
                    style={{ color: 'var(--pos-text)' }}
                  >
                    {item.producto.nombre}
                  </span>
                  {item.paraLlevar && (
                    <span
                      className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                      style={{ backgroundColor: 'var(--pos-warning-bg)', color: 'var(--pos-warning)' }}
                    >
                      Llevar
                    </span>
                  )}
                </div>

                {/* Price */}
                <span
                  className="text-xs font-semibold tabular-nums shrink-0 w-16 text-right"
                  style={{ color: 'var(--pos-text)' }}
                >
                  {formatearPrecio(precio(item))}
                </span>

                {/* Para llevar toggle */}
                <button
                  onClick={() => onToggleParaLlevar(item.id)}
                  className="touch-target w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0"
                  style={{
                    backgroundColor: item.paraLlevar ? 'var(--pos-warning-bg)' : 'var(--pos-surface-2)',
                    color: item.paraLlevar ? 'var(--pos-warning)' : 'var(--pos-text-disabled)',
                  }}
                  title="Toggle para llevar"
                >
                  <Package size={13} />
                </button>

                {/* Remove */}
                <button
                  onClick={() => onQuitarItem(item.id)}
                  className="touch-target w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0"
                  style={{ backgroundColor: 'var(--pos-danger-bg)', color: 'var(--pos-danger)' }}
                  aria-label="Quitar item"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}

          {/* Extras */}
          {extras.length > 0 && (
            <div
              className="mt-2 pt-2 space-y-1"
              style={{ borderTop: '1px dashed var(--pos-border)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--pos-text-muted)' }}>
                Extras
              </p>
              {extras.map((e) => (
                <div key={e.id} className="flex justify-between items-center text-xs py-0.5">
                  <span style={{ color: 'var(--pos-text-muted)' }}>+ {e.descripcion}</span>
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--pos-warning)' }}>
                    {formatearPrecio(e.monto)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Totals block ── */}
        <div
          className="mx-4 mt-1 mb-3 rounded-2xl p-3 space-y-1.5"
          style={{ backgroundColor: 'var(--pos-surface-2)', border: '1px solid var(--pos-border)' }}
        >
          {/* Subtotal if extras exist */}
          {extras.length > 0 && (
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--pos-text-muted)' }}>Subtotal productos</span>
              <span className="tabular-nums" style={{ color: 'var(--pos-text-2)' }}>
                {formatearPrecio(subtotalProductos)}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="font-heading text-sm font-bold" style={{ color: 'var(--pos-text)' }}>
              Total
            </span>
            <span
              className="font-heading text-lg font-bold tabular-nums"
              style={{ color: 'var(--pos-primary)' }}
            >
              {formatearPrecio(total)}
            </span>
          </div>

          {/* Pensionista balance rows */}
          {esPensionista && saldoPensionista !== undefined && (
            <>
              <div
                className="pt-1.5 mt-1 space-y-1"
                style={{ borderTop: '1px dashed var(--pos-divider)' }}
              >
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--pos-text-muted)' }}>Saldo disponible</span>
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--pos-success)' }}>
                    {formatearPrecio(saldoPensionista)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--pos-text-muted)' }}>Saldo tras pedido</span>
                  <span
                    className="tabular-nums font-semibold"
                    style={{ color: saldoInsuficiente ? 'var(--pos-danger)' : 'var(--pos-success)' }}
                  >
                    {formatearPrecio(saldoTras ?? 0)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Balance warning */}
        {saldoInsuficiente && (
          <div
            className="mx-4 mb-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
            style={{ backgroundColor: 'var(--pos-danger-bg)', color: 'var(--pos-danger)', border: '1px solid var(--pos-danger-border)' }}
          >
            <AlertTriangle size={14} className="shrink-0" />
            Saldo insuficiente para completar el pedido
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="px-4 pb-5 pt-1 flex gap-3">
          <button
            onClick={onCancelar}
            className="pos-btn pos-btn-ghost h-[52px] px-5 rounded-2xl text-sm font-semibold font-heading transition-all duration-150 active:scale-[0.97]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={items.length === 0 || disabled}
            className="pos-btn pos-btn-primary flex-1 h-[52px] rounded-2xl text-white font-heading font-bold text-sm tracking-wide transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              boxShadow: items.length > 0 && !disabled ? 'var(--pos-shadow-cyan)' : 'none',
            }}
          >
            <CheckCircle size={17} className="inline-block mr-1.5 -mt-0.5" />
            {confirmLabel || 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
