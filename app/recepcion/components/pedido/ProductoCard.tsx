'use client'

import type { Producto, TipoCliente } from '../../lib/types'
import { formatearPrecio } from '../../lib/utils'
import { Plus, Minus, PackageOpen } from 'lucide-react'

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
  producto, cantidad, deshabilitado, tipoCliente, onAgregarAqui, onAgregarParaLlevar, onQuitar,
}: ProductoCardProps) {
  const precio = tipoCliente === 'regular' ? producto.precioRegular : producto.precioPension

  return (
    <div
      className="relative rounded-xl p-3 flex flex-col justify-between transition-all duration-200"
      style={{
        backgroundColor: cantidad > 0 ? 'rgba(192, 113, 74, 0.08)' : 'var(--pos-card)',
        border: `1.5px solid ${cantidad > 0 ? 'var(--pos-primary)' : 'var(--pos-border)'}`,
        opacity: deshabilitado ? 0.45 : 1,
        cursor: deshabilitado ? 'not-allowed' : 'default',
        pointerEvents: deshabilitado ? 'none' : 'auto',
        minHeight: '100px',
      }}
    >
      {/* Quantity badge */}
      {cantidad > 0 && (
        <span
          className="absolute -top-2 -right-2 min-w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center text-white px-1 shadow-sm"
          style={{ backgroundColor: 'var(--pos-primary)' }}
        >
          {cantidad}
        </span>
      )}

      {/* Favorite star */}
      {producto.esFavorito && (
        <span className="absolute top-2 right-2 text-xs">⭐</span>
      )}

      {/* Info */}
      <div className="mb-2">
        <h4 className="text-sm font-semibold leading-tight mb-0.5" style={{ color: 'var(--pos-text)' }}>
          {producto.nombre}
        </h4>
        <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
          {formatearPrecio(precio)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-auto">
        {cantidad > 0 && (
          <button
            onClick={onQuitar}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-[0.9]"
            style={{ backgroundColor: 'var(--pos-danger-bg)', color: 'var(--pos-danger)' }}
          >
            <Minus size={14} />
          </button>
        )}
        <button
          onClick={onAgregarAqui}
          className="flex-1 h-8 rounded-lg flex items-center justify-center gap-1 text-xs font-medium transition-all duration-150 active:scale-[0.95]"
          style={{ backgroundColor: 'var(--pos-success-bg)', color: 'var(--pos-success)' }}
        >
          <Plus size={14} />
          Aquí
        </button>
        <button
          onClick={onAgregarParaLlevar}
          className="h-8 px-2 rounded-lg flex items-center justify-center gap-1 text-xs font-medium transition-all duration-150 active:scale-[0.95]"
          style={{ backgroundColor: 'var(--pos-warning-bg)', color: 'var(--pos-warning)' }}
          title="Para llevar"
        >
          <PackageOpen size={14} />
        </button>
      </div>
    </div>
  )
}
