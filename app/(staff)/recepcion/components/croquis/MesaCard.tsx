'use client'

import type { Mesa } from '../../lib/types'
import { UtensilsCrossed, Link2, Wifi } from 'lucide-react'

interface MesaCardProps {
  mesa: Mesa
  mesasUnidas?: Mesa[]
  posX: number
  posY: number
  ancho: number
  alto: number
  onTap: () => void
  esGrupoUnido?: boolean
}

export default function MesaCard({
  mesa,
  mesasUnidas,
  posX,
  posY,
  ancho,
  alto,
  onTap,
  esGrupoUnido,
}: MesaCardProps) {
  const esUnida   = esGrupoUnido || mesa.unidaCon.length > 0
  const esOcupado = mesa.estado === 'ocupado'
  const esLibre   = mesa.estado === 'libre'

  /* ── Display name ── */
  let nombre = `Mesa ${mesa.numero}`
  if (esUnida && mesasUnidas && mesasUnidas.length > 0) {
    const nums = mesasUnidas.map((m) => m.numero).sort().join('-')
    nombre = `Mesa ${mesa.numero}-${nums}`
  }

  /* ── CSS state class ── */
  const mesaClass = esOcupado ? 'mesa-ocupado' : esUnida ? 'mesa-unida' : 'mesa-libre'

  /* ── Badge ── */
  let badgeClass: string
  let badgeLabel: string
  if (esOcupado && esUnida) {
    badgeClass = 'badge-ocupado'
    badgeLabel = 'Unida · Ocupado'
  } else if (esOcupado) {
    badgeClass = 'badge-ocupado'
    badgeLabel = 'Ocupado'
  } else if (esUnida) {
    badgeClass = 'badge-libre'
    badgeLabel = 'Unidas'
  } else {
    badgeClass = 'badge-libre'
    badgeLabel = 'Libre'
  }

  return (
    <button
      onClick={onTap}
      className={`
        absolute flex flex-col items-center justify-center gap-1.5
        cursor-pointer select-none rounded-[var(--pos-radius-lg)]
        transition-all duration-250 touch-target
        hover:scale-[1.03] active:scale-[0.97]
        ${mesaClass}
      `}
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        width: `${ancho}%`,
        height: `${alto}%`,
        transitionTimingFunction: 'var(--pos-ease-spring)',
        zIndex: 10,
        borderRadius: 'var(--pos-radius-lg)',
      }}
    >
      {/* ── Status dot (occupied: pulse ring) ── */}
      {esOcupado && (
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse-ring"
          style={{ backgroundColor: 'var(--pos-primary)' }}
        />
      )}

      {/* ── Icon ── */}
      <span
        className="flex items-center justify-center transition-transform duration-200"
        style={{
          color: esOcupado
            ? 'var(--pos-table-occupied)'
            : esUnida
            ? 'var(--pos-primary)'
            : 'var(--pos-table-free)',
        }}
      >
        {esOcupado ? (
          <Wifi size={20} strokeWidth={2} />
        ) : esUnida ? (
          <Link2 size={20} strokeWidth={2} />
        ) : (
          <UtensilsCrossed size={20} strokeWidth={1.8} />
        )}
      </span>

      {/* ── Table number (large + prominent) ── */}
      <span
        className="font-heading text-xs sm:text-sm font-bold leading-tight text-center px-1"
        style={{
          color: esOcupado
            ? 'var(--pos-table-occupied)'
            : esUnida
            ? 'var(--pos-primary)'
            : 'var(--pos-text)',
          fontSize: 'clamp(10px, 1.4vw, 13px)',
          letterSpacing: '-0.01em',
        }}
      >
        {nombre}
      </span>

      {/* ── Status badge ── */}
      <span className={`${badgeClass} text-tabular`}>
        {badgeLabel}
      </span>
    </button>
  )
}
