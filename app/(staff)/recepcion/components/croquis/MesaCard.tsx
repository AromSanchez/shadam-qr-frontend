'use client'

import type { Mesa } from '../../lib/types'
import { UtensilsCrossed, Link2 } from 'lucide-react'

interface MesaCardProps {
  mesa: Mesa
  mesasUnidas?: Mesa[]
  posX: number
  posY: number
  ancho: number
  alto: number
  onTap: () => void
}

export default function MesaCard({ mesa, mesasUnidas, posX, posY, ancho, alto, onTap }: MesaCardProps) {
  const esUnida = mesa.unidaCon.length > 0
  const esOcupado = mesa.estado === 'ocupado'
  const esLibre = mesa.estado === 'libre'

  let nombre = `Mesa ${mesa.numero}`
  if (esUnida && mesasUnidas && mesasUnidas.length > 0) {
    const nums = mesasUnidas.map((m) => m.numero).sort().join('-')
    nombre = `Mesa ${mesa.numero}-${nums}`
  }

  // CSS class: occupied takes priority even for merged tables
  const mesaClass = esOcupado ? 'mesa-ocupado' : esUnida ? 'mesa-unida' : 'mesa-libre'
  const iconCol = esOcupado ? 'var(--pos-danger)' : esUnida ? 'var(--pos-primary)' : 'var(--pos-success)'

  // Badge: show both states for merged tables
  let badgeClass: string
  let badgeLabel: string
  if (esOcupado && esUnida) {
    badgeClass = 'badge-ocupado'
    badgeLabel = '🔗 Ocupado'
  } else if (esOcupado) {
    badgeClass = 'badge-ocupado'
    badgeLabel = 'Ocupado'
  } else if (esUnida) {
    badgeClass = 'badge-libre'
    badgeLabel = '🔗 Unidas'
  } else {
    badgeClass = 'badge-libre'
    badgeLabel = 'Libre'
  }

  return (
    <button
      onClick={onTap}
      className={`absolute flex flex-col items-center justify-center gap-1.5 rounded-xl cursor-pointer select-none
                 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${mesaClass}`}
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        width: `${ancho}%`,
        height: `${alto}%`,
      }}
    >
      {esUnida ? (
        <Link2 size={20} style={{ color: iconCol }} />
      ) : (
        <UtensilsCrossed size={20} style={{ color: iconCol }} />
      )}
      <span className="font-heading text-xs sm:text-sm font-bold leading-tight" style={{ color: 'var(--pos-text)' }}>
        {nombre}
      </span>
      <span className={badgeClass}>
        {badgeLabel}
      </span>
    </button>
  )
}
