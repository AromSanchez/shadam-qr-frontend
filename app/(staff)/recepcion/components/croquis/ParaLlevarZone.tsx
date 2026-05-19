'use client'

import { ShoppingBag } from 'lucide-react'

interface ParaLlevarZoneProps {
  cantidadPedidos: number
  onTap: () => void
  posX: number
  posY: number
  ancho: number
  alto: number
}

export default function ParaLlevarZone({ cantidadPedidos, onTap, posX, posY, ancho, alto }: ParaLlevarZoneProps) {
  // Dynamic class based on order count
  const zoneClass = cantidadPedidos === 0
    ? 'zona-para-llevar-0'
    : cantidadPedidos <= 2
      ? 'zona-para-llevar-low'
      : 'zona-para-llevar-high'

  const color = cantidadPedidos === 0
    ? 'var(--pos-success)'
    : cantidadPedidos <= 2
      ? 'var(--pos-warning)'
      : 'var(--pos-danger)'

  return (
    <button
      onClick={onTap}
      className={`absolute flex items-center justify-center gap-2 rounded-xl cursor-pointer select-none
                 border-2 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${zoneClass}`}
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        width: `${ancho}%`,
        height: `${alto}%`,
      }}
    >
      <ShoppingBag size={18} style={{ color }} />
      <span className="font-heading text-xs sm:text-sm font-bold" style={{ color: 'var(--pos-text)' }}>
        Para llevar
      </span>
      {cantidadPedidos > 0 && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
          style={{ backgroundColor: color }}
        >
          {cantidadPedidos}
        </span>
      )}
    </button>
  )
}
