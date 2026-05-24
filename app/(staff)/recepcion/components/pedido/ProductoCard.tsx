'use client'

import { useState } from 'react'
import type { Producto, TipoCliente } from '../../lib/types'
import { formatearPrecio } from '../../lib/utils'
import { Plus, Minus, Package, Star } from 'lucide-react'

interface ProductoCardProps {
  producto: Producto
  cantidad: number
  deshabilitado: boolean
  tipoCliente: TipoCliente
  onAgregarAqui: () => void
  onAgregarParaLlevar: () => void
  onQuitar: () => void
}

export default function ProductoCard({
  producto,
  cantidad,
  deshabilitado,
  tipoCliente,
  onAgregarAqui,
  onAgregarParaLlevar,
  onQuitar,
}: ProductoCardProps) {
  const [pressing, setPressing] = useState(false)
  const esPensionista = tipoCliente !== 'regular'
  const precio = esPensionista ? producto.precioPension : producto.precioRegular
  const activo = cantidad > 0

  return (
    <div
      className="relative flex flex-col rounded-[20px] transition-all select-none"
      style={{
        minHeight: '120px',
        opacity: deshabilitado ? 0.4 : 1,
        pointerEvents: deshabilitado ? 'none' : 'auto',
        cursor: deshabilitado ? 'not-allowed' : 'pointer',
        backgroundColor: activo ? 'color-mix(in srgb, var(--pos-primary) 8%, var(--pos-card))' : 'var(--pos-card)',
        border: `1.5px solid ${activo ? 'var(--pos-primary)' : 'var(--pos-border)'}`,
        boxShadow: activo ? 'var(--pos-shadow-cyan)' : 'var(--pos-shadow-sm)',
        transform: pressing ? 'scale(0.97) translateY(1px)' : 'scale(1) translateY(0)',
        transition: 'transform 200ms var(--pos-ease-spring), box-shadow 200ms ease, background-color 200ms ease, border-color 200ms ease',
      }}
      onPointerDown={() => setPressing(true)}
      onPointerUp={() => { setPressing(false); onAgregarAqui() }}
      onPointerLeave={() => setPressing(false)}
    >
      {/* Floating quantity badge */}
      {activo && (
        <span
          className="absolute -top-2.5 -right-2.5 min-w-[26px] h-[26px] rounded-full text-[11px] font-bold font-heading flex items-center justify-center text-white px-1.5 z-10 animate-bounce-in"
          style={{
            backgroundColor: 'var(--pos-primary)',
            boxShadow: '0 0 10px color-mix(in srgb, var(--pos-primary) 60%, transparent)',
          }}
        >
          {cantidad}
        </span>
      )}

      {/* Favorite star — top-left */}
      {producto.esFavorito && (
        <span
          className="absolute top-2.5 left-2.5 z-10"
          style={{ color: '#FBBF24' }}
        >
          <Star size={13} fill="currentColor" />
        </span>
      )}

      {/* Card body — not interactive so inner buttons can capture clicks */}
      <div className="flex flex-col flex-1 p-3 pt-3.5">
        {/* Name */}
        <h4
          className="font-heading text-sm font-bold leading-snug tracking-tight mb-1 line-clamp-2"
          style={{ color: 'var(--pos-text)' }}
        >
          {producto.nombre}
        </h4>

        {/* Price */}
        <span
          className="text-xs font-semibold tabular-nums mb-auto"
          style={{ color: esPensionista ? 'var(--pos-primary)' : 'var(--pos-text-muted)' }}
        >
          {formatearPrecio(precio)}
        </span>

        {/* Controls row */}
        <div
          className="flex items-center gap-1.5 mt-2.5"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {activo ? (
            <>
              {/* Minus */}
              <button
                onPointerDown={(e) => { e.stopPropagation(); setPressing(false) }}
                onClick={(e) => { e.stopPropagation(); onQuitar() }}
                className="touch-target w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0"
                style={{ backgroundColor: 'var(--pos-danger-bg)', color: 'var(--pos-danger)' }}
                aria-label="Quitar uno"
              >
                <Minus size={15} />
              </button>

              {/* Plus */}
              <button
                onPointerDown={(e) => { e.stopPropagation(); setPressing(false) }}
                onClick={(e) => { e.stopPropagation(); onAgregarAqui() }}
                className="touch-target flex-1 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold font-heading transition-all duration-150 active:scale-[0.95]"
                style={{ backgroundColor: 'color-mix(in srgb, var(--pos-primary) 15%, transparent)', color: 'var(--pos-primary)' }}
                aria-label="Agregar aquí"
              >
                <Plus size={15} />
                Aquí
              </button>

              {/* Para llevar */}
              <button
                onPointerDown={(e) => { e.stopPropagation(); setPressing(false) }}
                onClick={(e) => { e.stopPropagation(); onAgregarParaLlevar() }}
                className="touch-target w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0"
                style={{ backgroundColor: 'var(--pos-warning-bg)', color: 'var(--pos-warning)' }}
                aria-label="Para llevar"
                title="Para llevar"
              >
                <Package size={15} />
              </button>
            </>
          ) : (
            /* Initial add button when qty = 0 */
            <button
              onPointerDown={(e) => { e.stopPropagation(); setPressing(false) }}
              onClick={(e) => { e.stopPropagation(); onAgregarAqui() }}
              className="touch-target flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold font-heading transition-all duration-150 active:scale-[0.95]"
              style={{ backgroundColor: 'var(--pos-surface-2)', color: 'var(--pos-text-muted)' }}
              aria-label="Agregar producto"
            >
              <Plus size={15} />
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
