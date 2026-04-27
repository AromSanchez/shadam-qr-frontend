'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import type { Producto, ModoPension, CategoriaProducto } from '../../lib/types'
import { detectarModo, generarId } from '../../lib/utils'

interface FormProductoProps {
  producto?: Producto
  open: boolean
  onClose: () => void
  onGuardar: (producto: Producto | Omit<Producto, 'id'>) => void
}

const catsPorModo: Record<ModoPension, { value: CategoriaProducto; label: string }[]> = {
  desayuno: [
    { value: 'bebida', label: 'Bebida' },
    { value: 'acompañamiento', label: 'Acompañamiento' },
    { value: 'caldo', label: 'Caldo' },
    { value: 'otro', label: 'Otro' },
  ],
  almuerzo: [
    { value: 'refresco', label: 'Refresco' },
    { value: 'entrada', label: 'Entrada' },
    { value: 'segundo', label: 'Segundo' },
    { value: 'otro', label: 'Otro' },
  ],
  cena: [
    { value: 'sopa', label: 'Sopa' },
    { value: 'infusion', label: 'Infusión' },
    { value: 'plato_ligero', label: 'Plato ligero' },
    { value: 'otro', label: 'Otro' },
  ],
}

export default function FormProducto({ producto, open, onClose, onGuardar }: FormProductoProps) {
  const isEdit = !!producto
  const [nombre, setNombre] = useState(producto?.nombre || '')
  const [modo, setModo] = useState<ModoPension>(producto?.modo[0] || detectarModo())
  const [categoria, setCategoria] = useState<CategoriaProducto>(producto?.categoria || catsPorModo[modo][0].value)
  const [precioPension, setPrecioPension] = useState(producto?.precioPension?.toString() || '')
  const [precioRegular, setPrecioRegular] = useState(producto?.precioRegular?.toString() || '')
  const [esFavorito, setEsFavorito] = useState(producto?.esFavorito || false)
  const [activo, setActivo] = useState(producto?.activo ?? true)

  if (!open) return null

  const handleModoChange = (m: ModoPension) => {
    setModo(m)
    setCategoria(catsPorModo[m][0].value)
  }

  const handlePrecioPensionChange = (val: string) => {
    setPrecioPension(val)
    const num = parseFloat(val)
    if (!isNaN(num) && (!precioRegular || (producto && parseFloat(precioRegular) === producto.precioRegular))) {
      setPrecioRegular((num + 2.5).toFixed(1))
    }
  }

  const isValid = nombre.trim().length >= 3 && parseFloat(precioPension) > 0 && parseFloat(precioRegular) >= parseFloat(precioPension)

  const handleSubmit = () => {
    if (!isValid) return
    const data = {
      nombre: nombre.trim(),
      precioPension: parseFloat(precioPension),
      precioRegular: parseFloat(precioRegular),
      categoria,
      modo: [modo] as ModoPension[],
      activo,
      esFavorito,
    }
    if (isEdit && producto) {
      onGuardar({ ...data, id: producto.id })
    } else {
      onGuardar(data)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--pos-overlay)' }} />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--pos-card)' }}>
        <div className="flex items-center justify-between p-5 sticky top-0 z-10" style={{ borderBottom: '1px solid var(--pos-border)', backgroundColor: 'var(--pos-card)' }}>
          <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>
            {isEdit ? 'Editar producto' : 'Agregar producto'}
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: 'var(--pos-text-muted)' }}><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--pos-text-muted)' }}>Nombre *</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Mínimo 3 caracteres" className="w-full h-11 px-3 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--pos-bg)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }} />
          </div>

          {/* Modo */}
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--pos-text-muted)' }}>Modo *</label>
            <div className="flex gap-2">
              {(['desayuno', 'almuerzo', 'cena'] as ModoPension[]).map((m) => (
                <button key={m} onClick={() => handleModoChange(m)} className="flex-1 h-10 rounded-xl text-sm font-medium capitalize transition-all" style={{ backgroundColor: modo === m ? 'var(--pos-primary)' : 'var(--pos-bg)', color: modo === m ? '#fff' : 'var(--pos-text-muted)', border: `1px solid ${modo === m ? 'var(--pos-primary)' : 'var(--pos-border)'}` }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--pos-text-muted)' }}>Categoría *</label>
            <div className="flex flex-wrap gap-2">
              {catsPorModo[modo].map((c) => (
                <button key={c.value} onClick={() => setCategoria(c.value)} className="h-9 px-3 rounded-xl text-xs font-medium transition-all" style={{ backgroundColor: categoria === c.value ? 'var(--pos-primary)' : 'var(--pos-bg)', color: categoria === c.value ? '#fff' : 'var(--pos-text-muted)', border: `1px solid ${categoria === c.value ? 'var(--pos-primary)' : 'var(--pos-border)'}` }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--pos-text-muted)' }}>Precio pensión *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--pos-text-muted)' }}>S/</span>
                <input type="number" value={precioPension} onChange={(e) => handlePrecioPensionChange(e.target.value)} className="w-full h-11 pl-8 pr-3 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--pos-bg)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--pos-text-muted)' }}>Precio regular *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--pos-text-muted)' }}>S/</span>
                <input type="number" value={precioRegular} onChange={(e) => setPrecioRegular(e.target.value)} className="w-full h-11 pl-8 pr-3 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--pos-bg)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }} />
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--pos-text-muted)' }}>Sugerido: pensión + S/2.50</p>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--pos-text)' }}>¿Es favorito?</span>
            <button onClick={() => setEsFavorito(!esFavorito)} className="w-12 h-7 rounded-full transition-all duration-200 relative" style={{ backgroundColor: esFavorito ? 'var(--pos-warning)' : 'var(--pos-border)' }}>
              <div className="absolute w-5 h-5 rounded-full bg-white top-1 transition-all duration-200 shadow-sm" style={{ left: esFavorito ? '26px' : '4px' }} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--pos-text)' }}>Activo</span>
            <button onClick={() => setActivo(!activo)} className="w-12 h-7 rounded-full transition-all duration-200 relative" style={{ backgroundColor: activo ? 'var(--pos-success)' : 'var(--pos-border)' }}>
              <div className="absolute w-5 h-5 rounded-full bg-white top-1 transition-all duration-200 shadow-sm" style={{ left: activo ? '26px' : '4px' }} />
            </button>
          </div>
        </div>

        <div className="p-5 flex gap-3" style={{ borderTop: '1px solid var(--pos-border)' }}>
          <button onClick={onClose} className="flex-1 h-12 rounded-xl font-medium text-sm" style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text-muted)' }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={!isValid} className="flex-1 h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40" style={{ backgroundColor: 'var(--pos-success)' }}>
            <Check size={16} /> Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
