'use client'

import { X, UserCheck, GraduationCap, Link2, Scissors, ClipboardList } from 'lucide-react'
import type { Mesa } from '../../lib/types'

interface ModalAccionMesaProps {
  mesa: Mesa
  open: boolean
  onClose: () => void
  onClienteRegular: () => void
  onPensionista: () => void
  onUnir: () => void
  onSeparar: () => void
  hayMesasDisponibles: boolean
  onVerPedido?: () => void
}

export default function ModalAccionMesa({
  mesa,
  open,
  onClose,
  onClienteRegular,
  onPensionista,
  onUnir,
  onSeparar,
  hayMesasDisponibles,
  onVerPedido,
}: ModalAccionMesaProps) {
  if (!open) return null

  const esUnida   = mesa.unidaCon.length > 0
  const esOcupado = mesa.estado === 'ocupado'

  const titulo = esUnida
    ? `Mesa ${mesa.numero}-${mesa.unidaCon.map((id) => id.replace('mesa-', '')).join('-')}`
    : mesa.id === 'para_llevar'
    ? 'Para llevar'
    : `Mesa ${mesa.numero}`

  /* ── Status indicator dot color ── */
  const dotColor = esOcupado
    ? 'var(--pos-table-occupied)'
    : 'var(--pos-success)'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="pos-modal-overlay absolute inset-0" />

      {/* Sheet / Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="pos-modal relative w-[calc(100%-1.5rem)] sm:w-full sm:max-w-sm animate-slide-up mx-auto mb-24 sm:mb-0"
        style={{
          borderRadius: 'var(--pos-radius-2xl)',
        }}
      >
        {/* ── Mobile drag indicator ── */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--pos-border-2)' }}
          />
        </div>

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-4 sm:pt-5"
          style={{ borderBottom: '1px solid var(--pos-divider)' }}
        >
          <div className="flex items-center gap-3">
            {/* Status dot */}
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: dotColor,
                boxShadow: esOcupado
                  ? '0 0 8px rgba(6,182,212,0.5)'
                  : '0 0 8px rgba(34,197,94,0.5)',
              }}
            />
            <h2
              className="font-heading text-base sm:text-lg font-bold leading-tight"
              style={{ color: 'var(--pos-text)' }}
            >
              {titulo}
            </h2>
            <span
              className="text-[11px] font-heading font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: esOcupado
                  ? 'var(--pos-table-occupied-bg)'
                  : 'var(--pos-success-bg)',
                color: esOcupado
                  ? 'var(--pos-table-occupied)'
                  : 'var(--pos-success)',
                border: `1px solid ${esOcupado ? 'var(--pos-table-occupied-border)' : 'var(--pos-success-border)'}`,
              }}
            >
              {esOcupado ? 'Ocupado' : 'Libre'}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="pos-btn w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{
              color: 'var(--pos-text-muted)',
              background: 'var(--pos-surface-2)',
              border: '1px solid var(--pos-border)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Actions body ── */}
        <div className="px-5 py-4 space-y-2.5">

          {/* OCCUPIED: Show active order button */}
          {esOcupado ? (
            <button
              onClick={onVerPedido}
              className="pos-btn pos-btn-primary w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base"
              style={{ fontSize: '0.9375rem' }}
            >
              <ClipboardList size={20} />
              Ver pedido activo
            </button>
          ) : (
            /* LIBRE: Show customer type buttons */
            <>
              <button
                onClick={onClienteRegular}
                className="pos-btn pos-btn-primary w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base"
                style={{ fontSize: '0.9375rem' }}
              >
                <UserCheck size={20} />
                Cliente regular
              </button>

              <button
                onClick={onPensionista}
                className="pos-btn pos-btn-secondary w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base"
                style={{ fontSize: '0.9375rem' }}
              >
                <GraduationCap size={20} />
                Pensionista
              </button>
            </>
          )}

          {/* Divider */}
          {(hayMesasDisponibles || esUnida) && mesa.id !== 'para_llevar' && (
            <div
              className="h-px my-1"
              style={{ backgroundColor: 'var(--pos-divider)' }}
            />
          )}

          {/* Unir mesa (ghost) */}
          {hayMesasDisponibles && mesa.id !== 'para_llevar' && (
            <button
              onClick={onUnir}
              className="pos-btn pos-btn-ghost w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base"
              style={{ fontSize: '0.9375rem' }}
            >
              <Link2 size={20} />
              Unir con mesa
            </button>
          )}

          {/* Separar (danger outline) */}
          {esUnida && (
            <button
              onClick={onSeparar}
              className="pos-btn pos-btn-danger w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base"
              style={{ fontSize: '0.9375rem' }}
            >
              <Scissors size={20} />
              Separar mesas
            </button>
          )}
        </div>

        {/* Bottom safe area padding for mobile */}
        <div className="h-3 sm:h-1" />
      </div>
    </div>
  )
}
