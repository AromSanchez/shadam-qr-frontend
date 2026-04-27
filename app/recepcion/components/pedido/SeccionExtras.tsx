'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Extra } from '../../lib/types'
import { generarId, formatearPrecio } from '../../lib/utils'

interface SeccionExtrasProps {
  extras: Extra[]
  onAgregarExtra: (extra: Omit<Extra, 'id'>) => void
  onEliminarExtra: (id: string) => void
}

export default function SeccionExtras({ extras, onAgregarExtra, onEliminarExtra }: SeccionExtrasProps) {
  const [desc, setDesc] = useState('')
  const [monto, setMonto] = useState('')
  const [abierto, setAbierto] = useState(false)

  const handleAgregar = () => {
    if (!desc.trim() || !monto.trim() || parseFloat(monto) <= 0) return
    onAgregarExtra({ descripcion: desc.trim(), monto: parseFloat(monto) })
    setDesc('')
    setMonto('')
  }

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--pos-card)', border: '1px solid var(--pos-border)' }}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between text-sm font-medium"
        style={{ color: 'var(--pos-text-muted)' }}
      >
        <span>Extras / Cobros adicionales {extras.length > 0 && `(${extras.length})`}</span>
        <span>{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div className="mt-3 space-y-2 animate-fade-in">
          {/* Existing extras */}
          {extras.map((extra) => (
            <div key={extra.id} className="flex items-center justify-between py-1.5 text-sm" style={{ borderBottom: '1px solid var(--pos-border)' }}>
              <span style={{ color: 'var(--pos-text)' }}>{extra.descripcion}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: 'var(--pos-warning)' }}>{formatearPrecio(extra.monto)}</span>
                <button onClick={() => onEliminarExtra(extra.id)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--pos-danger)' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* Add form */}
          <div className="flex gap-2 pt-1">
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descripción (ej: vaso roto)"
              className="flex-1 h-9 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--pos-bg)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }}
            />
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="S/"
              className="w-20 h-9 px-2 rounded-lg text-sm outline-none text-right"
              style={{ backgroundColor: 'var(--pos-bg)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }}
            />
            <button
              onClick={handleAgregar}
              className="h-9 px-3 rounded-lg text-white text-sm font-medium transition-all duration-150 active:scale-[0.95]"
              style={{ backgroundColor: 'var(--pos-primary)' }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
