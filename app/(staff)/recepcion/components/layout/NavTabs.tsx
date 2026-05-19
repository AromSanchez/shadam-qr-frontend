'use client'

import { LayoutGrid, ClipboardList, UtensilsCrossed } from 'lucide-react'
import { usePosContext } from '../../context/PosContext'

const tabs = [
  { id: 'croquis',  label: 'Croquis',  Icon: LayoutGrid },
  { id: 'pedidos',  label: 'Pedidos',  Icon: ClipboardList },
  { id: 'menu',     label: 'Menú',     Icon: UtensilsCrossed },
] as const

interface NavTabsProps {
  tabActiva: string
  onCambiar: (tab: string) => void
}

export default function NavTabs({ tabActiva, onCambiar }: NavTabsProps) {
  const { state } = usePosContext()
  const pedidosActivos = state.pedidos.filter((p) => p.estado === 'activo').length

  return (
    <>
      {/* Desktop: top sticky */}
      <nav
        className="pos-nav hidden sm:flex items-center gap-1 px-4 py-2 border-b sticky top-[60px] z-30"
      >
        {tabs.map((tab) => {
          const active = tabActiva === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onCambiar(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active ? 'pos-nav-item-active' : 'pos-nav-item-inactive'
              }`}
              style={{
                backgroundColor: active ? 'var(--pos-primary)' : 'transparent',
                color: active ? '#FFFDF9' : undefined,
              }}
            >
              <tab.Icon size={18} />
              {tab.label}
              {tab.id === 'pedidos' && pedidosActivos > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1"
                  style={{ backgroundColor: 'var(--pos-danger)' }}
                >
                  {pedidosActivos}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Mobile: bottom fixed */}
      <nav
        className="pos-nav sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t h-16"
      >
        {tabs.map((tab) => {
          const active = tabActiva === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onCambiar(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 ${
                active ? 'pos-nav-item-active' : 'pos-nav-item-inactive'
              }`}
            >
              <tab.Icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.id === 'pedidos' && pedidosActivos > 0 && (
                <span
                  className="absolute top-1.5 right-[calc(50%-18px)] min-w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center text-white px-0.5"
                  style={{ backgroundColor: 'var(--pos-danger)' }}
                >
                  {pedidosActivos}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </>
  )
}
