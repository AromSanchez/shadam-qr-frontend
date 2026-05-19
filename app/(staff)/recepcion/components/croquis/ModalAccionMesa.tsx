'use client'

import { X, UserCheck, GraduationCap, Link2, Scissors } from 'lucide-react'
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
}

export default function ModalAccionMesa({
  mesa, open, onClose, onClienteRegular, onPensionista, onUnir, onSeparar, hayMesasDisponibles,
}: ModalAccionMesaProps) {
  if (!open) return null

  const esUnida = mesa.unidaCon.length > 0
  const titulo = esUnida
    ? `Mesa ${mesa.numero}-${mesa.unidaCon.map((id) => id.replace('mesa-', '')).join('-')}`
    : mesa.id === 'para_llevar' ? '🛍️ Para llevar' : `Mesa ${mesa.numero}`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Overlay */}
      <div className="pos-modal-overlay absolute inset-0" />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="pos-modal relative w-full max-w-md animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--pos-border)' }}>
          <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>
            {titulo}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 hover:opacity-70"
            style={{ color: 'var(--pos-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="p-5 space-y-3">
          <button
            onClick={onClienteRegular}
            className="pos-btn pos-btn-primary w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base shadow-md"
          >
            <UserCheck size={20} />
            Cliente regular
          </button>

          <button
            onClick={onPensionista}
            className="pos-btn w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-3 text-base shadow-md"
            style={{ backgroundColor: 'var(--pos-secondary)' }}
          >
            <GraduationCap size={20} />
            Pensionista
          </button>

          {/* Unir mesa */}
          {hayMesasDisponibles && mesa.id !== 'para_llevar' && (
            <button
              onClick={onUnir}
              className="pos-btn pos-btn-secondary w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm"
            >
              <Link2 size={16} />
              Unir con mesa
            </button>
          )}

          {/* Separar */}
          {esUnida && (
            <button
              onClick={onSeparar}
              className="pos-btn w-full h-12 rounded-2xl font-medium flex items-center justify-center gap-2 text-sm"
              style={{ border: '2px solid var(--pos-danger)', color: 'var(--pos-danger)' }}
            >
              <Scissors size={16} />
              Separar mesas
            </button>
          )}
        </div>

        {/* Mobile drag indicator */}
        <div className="flex justify-center pb-4 sm:hidden">
          <div className="w-12 h-1 rounded-full" style={{ backgroundColor: 'var(--pos-border)' }} />
        </div>
      </div>
    </div>
  )
}
