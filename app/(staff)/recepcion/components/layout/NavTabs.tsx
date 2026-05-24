'use client'

import { LayoutGrid, ClipboardList, UtensilsCrossed } from 'lucide-react'
import { usePosContext } from '../../context/PosContext'

const tabs = [
  { id: 'croquis', label: 'Croquis',  Icon: LayoutGrid },
  { id: 'pedidos', label: 'Pedidos',  Icon: ClipboardList },
  { id: 'menu',    label: 'Menú',     Icon: UtensilsCrossed },
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
      {/* ── Desktop: horizontal tab bar with underline indicator ── */}
      <nav
        className="hidden sm:flex items-stretch gap-0 px-4 sticky top-[60px] z-30"
        style={{
          backgroundColor: 'var(--pos-surface)',
          borderBottom: '1px solid var(--pos-border)',
        }}
      >
        {tabs.map((tab) => {
          const active = tabActiva === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onCambiar(tab.id)}
              className="relative flex items-center gap-2 px-5 py-3 text-sm font-heading font-medium transition-all duration-200 touch-target"
              style={{
                color: active ? 'var(--pos-primary)' : 'var(--pos-text-muted)',
                fontWeight: active ? 600 : 500,
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--pos-text)'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--pos-text-muted)'
              }}
            >
              {/* Icon */}
              <tab.Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.8}
              />

              {/* Label */}
              <span>{tab.label}</span>

              {/* Badge count */}
              {tab.id === 'pedidos' && pedidosActivos > 0 && (
                <span
                  className="min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1 text-tabular"
                  style={{ backgroundColor: 'var(--pos-danger)' }}
                >
                  {pedidosActivos}
                </span>
              )}

              {/* Active underline bar */}
              <span
                className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor: active ? 'var(--pos-primary)' : 'transparent',
                  boxShadow: active ? '0 0 8px rgba(6,182,212,0.5)' : 'none',
                  transform: active ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'center',
                  transitionTimingFunction: 'var(--pos-ease-spring)',
                }}
              />
            </button>
          )
        })}
      </nav>

      {/* ── Mobile: floating pill-style bottom nav ── */}
      <nav
        className="sm:hidden fixed bottom-4 left-1/2 z-50 flex items-center"
        style={{
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '360px',
          borderRadius: 'var(--pos-radius-2xl)',
          background: 'rgba(21, 30, 48, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
          padding: '6px',
        }}
      >
        {tabs.map((tab) => {
          const active = tabActiva === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onCambiar(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 touch-target transition-all duration-250"
              style={{
                borderRadius: 'var(--pos-radius-xl)',
                minHeight: '52px',
                paddingTop: '6px',
                paddingBottom: '6px',
                background: active
                  ? 'rgba(6, 182, 212, 0.18)'
                  : 'transparent',
                transitionTimingFunction: 'var(--pos-ease-spring)',
              }}
            >
              {/* Active cyan pill background glow */}
              {active && (
                <span
                  className="absolute inset-0 rounded-[var(--pos-radius-xl)]"
                  style={{
                    background: 'rgba(6,182,212,0.12)',
                    boxShadow: '0 0 16px rgba(6,182,212,0.20)',
                    border: '1px solid rgba(6,182,212,0.25)',
                  }}
                />
              )}

              {/* Icon */}
              <span className="relative z-10">
                <tab.Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.7}
                  style={{ color: active ? 'var(--pos-primary)' : 'var(--pos-text-muted)' }}
                />
              </span>

              {/* Label */}
              <span
                className="relative z-10 text-[10px] font-heading font-semibold tracking-wide"
                style={{ color: active ? 'var(--pos-primary)' : 'var(--pos-text-muted)' }}
              >
                {tab.label}
              </span>

              {/* Badge count */}
              {tab.id === 'pedidos' && pedidosActivos > 0 && (
                <span
                  className="absolute top-1 right-[calc(50%-20px)] min-w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center text-white px-1 text-tabular z-20"
                  style={{ backgroundColor: 'var(--pos-danger)' }}
                >
                  {pedidosActivos}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Mobile bottom spacer so content isn't hidden under nav */}
      <div className="sm:hidden h-20" aria-hidden="true" />
    </>
  )
}
