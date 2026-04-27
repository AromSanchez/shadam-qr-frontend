'use client'

import { X, Trash2, PackageOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { ItemPedido, Extra, TipoCliente } from '../../lib/types'
import { formatearPrecio } from '../../lib/utils'

interface CarritoPanelProps {
  items: ItemPedido[]
  extras: Extra[]
  tipoCliente: TipoCliente
  saldoPensionista?: number
  confirmLabel?: string
  onQuitarItem: (itemId: string) => void
  onToggleParaLlevar: (itemId: string) => void
  onCancelar: () => void
  onConfirmar: () => void
}

export default function CarritoPanel({
  items, extras, tipoCliente, saldoPensionista, confirmLabel, onQuitarItem, onToggleParaLlevar, onCancelar, onConfirmar,
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
      className="sticky bottom-0 sm:relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ backgroundColor: 'var(--pos-card)', borderTop: '1px solid var(--pos-border)' }}
    >
      {/* Collapsible header on mobile */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="sm:hidden w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--pos-text)' }}>
            🛒 Carrito ({totalItems})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-heading text-base font-bold" style={{ color: 'var(--pos-primary)' }}>
            {formatearPrecio(total)}
          </span>
          {expandido ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </button>

      {/* Items list (always visible on desktop, collapsible on mobile) */}
      <div className={`${expandido ? 'block' : 'hidden'} sm:block max-h-48 overflow-y-auto px-4 py-2 space-y-1.5`}>
        {items.length === 0 ? (
          <p className="text-xs text-center py-3" style={{ color: 'var(--pos-text-muted)' }}>
            Carrito vacío
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm truncate" style={{ color: 'var(--pos-text)' }}>
                  {item.producto.nombre} × {item.cantidad}
                </span>
                {item.paraLlevar && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                    style={{ backgroundColor: 'var(--pos-warning-bg)', color: 'var(--pos-warning)' }}
                  >
                    🥡
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <span className="text-xs font-semibold w-14 text-right" style={{ color: 'var(--pos-text)' }}>
                  {formatearPrecio(precio(item))}
                </span>
                <button onClick={() => onToggleParaLlevar(item.id)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--pos-warning)' }} title="Toggle para llevar">
                  <PackageOpen size={12} />
                </button>
                <button onClick={() => onQuitarItem(item.id)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--pos-danger)' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}

        {extras.length > 0 && (
          <div className="pt-1" style={{ borderTop: '1px dashed var(--pos-border)' }}>
            {extras.map((e) => (
              <div key={e.id} className="flex justify-between text-xs py-0.5">
                <span style={{ color: 'var(--pos-text-muted)' }}>+ {e.descripcion}</span>
                <span style={{ color: 'var(--pos-warning)' }}>{formatearPrecio(e.monto)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        <div className="pt-2 space-y-1" style={{ borderTop: '1px solid var(--pos-border)' }}>
          <div className="flex justify-between text-sm font-bold">
            <span style={{ color: 'var(--pos-text)' }}>Total</span>
            <span style={{ color: 'var(--pos-primary)' }}>{formatearPrecio(total)}</span>
          </div>
          {esPensionista && saldoPensionista !== undefined && (
            <>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--pos-text-muted)' }}>Saldo disponible</span>
                <span style={{ color: 'var(--pos-success)' }}>{formatearPrecio(saldoPensionista)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--pos-text-muted)' }}>Saldo tras pedido</span>
                <span style={{ color: saldoInsuficiente ? 'var(--pos-danger)' : 'var(--pos-success)' }}>
                  {formatearPrecio(saldoTras ?? 0)}
                </span>
              </div>
            </>
          )}
        </div>

        {saldoInsuficiente && (
          <p className="text-xs px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--pos-danger-bg)', color: 'var(--pos-danger)' }}>
            ⚠️ Saldo insuficiente
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 pt-2 flex gap-3">
        <button
          onClick={onCancelar}
          className="h-12 px-5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
          style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text-muted)' }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          disabled={items.length === 0}
          className="flex-1 h-12 rounded-xl text-white font-semibold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          style={{ backgroundColor: 'var(--pos-success)' }}
        >
          {confirmLabel || 'Confirmar pedido'}
        </button>
      </div>
    </div>
  )
}
