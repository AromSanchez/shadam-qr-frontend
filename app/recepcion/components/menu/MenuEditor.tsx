'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Edit3, Trash2, Star } from 'lucide-react'
import type { Producto, ModoPension, CategoriaProducto } from '../../lib/types'
import { usePosContext } from '../../context/PosContext'
import { formatearPrecio, labelCategoria } from '../../lib/utils'
import FormProducto from './FormProducto'

type FiltroEstado = 'todos' | 'activos' | 'inactivos'

export default function MenuEditor() {
  const { state, actualizarProducto, agregarProducto, eliminarProducto, mostrarToast } = usePosContext()
  const { productos } = state

  const [busqueda, setBusqueda] = useState('')
  const [filtroModo, setFiltroModo] = useState<ModoPension | null>(null)
  const [filtroCat, setFiltroCat] = useState<CategoriaProducto | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | undefined>()

  const productosFiltrados = useMemo(() => {
    let result = [...productos]
    if (filtroModo) result = result.filter((p) => p.modo.includes(filtroModo))
    if (filtroCat) result = result.filter((p) => p.categoria === filtroCat)
    if (filtroEstado === 'activos') result = result.filter((p) => p.activo)
    if (filtroEstado === 'inactivos') result = result.filter((p) => !p.activo)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter((p) => p.nombre.toLowerCase().includes(q))
    }
    return result
  }, [productos, filtroModo, filtroCat, filtroEstado, busqueda])

  const categorias: CategoriaProducto[] = useMemo(() => {
    const all = productos.map((p) => p.categoria)
    return [...new Set(all)]
  }, [productos])

  const handleDelete = (prod: Producto) => {
    if (confirm(`¿Eliminar "${prod.nombre}"? Esta acción no se puede deshacer.`)) {
      eliminarProducto(prod.id)
      mostrarToast({ mensaje: `🗑️ ${prod.nombre} eliminado`, tipo: 'info' })
    }
  }

  const handleGuardar = (data: Producto | Omit<Producto, 'id'>) => {
    if ('id' in data) {
      actualizarProducto(data.id, data)
      mostrarToast({ mensaje: `✏️ ${data.nombre} actualizado`, tipo: 'success' })
    } else {
      agregarProducto(data)
      mostrarToast({ mensaje: `➕ ${data.nombre} agregado`, tipo: 'success' })
    }
  }

  return (
    <div className="animate-fade-in p-4 space-y-4 pb-24 sm:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>Gestión de Menú</h2>
        <button
          onClick={() => { setEditingProduct(undefined); setFormOpen(true) }}
          className="h-9 px-4 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
          style={{ backgroundColor: 'var(--pos-primary)' }}
        >
          <Plus size={14} /> Agregar
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--pos-text-muted)' }} />
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto..." className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--pos-card)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }} />
      </div>

      {/* Filter chips */}
      <div className="space-y-2">
        {/* Mode */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {([null, 'desayuno', 'almuerzo', 'cena'] as (ModoPension | null)[]).map((m) => (
            <button key={m ?? 'todos'} onClick={() => setFiltroModo(m)} className="shrink-0 h-8 px-3 rounded-lg text-xs font-medium capitalize transition-all" style={{ backgroundColor: filtroModo === m ? 'var(--pos-primary)' : 'var(--pos-bg)', color: filtroModo === m ? '#fff' : 'var(--pos-text-muted)', border: `1px solid ${filtroModo === m ? 'var(--pos-primary)' : 'var(--pos-border)'}` }}>
              {m ?? 'Todos'}
            </button>
          ))}
        </div>
        {/* Category */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button onClick={() => setFiltroCat(null)} className="shrink-0 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all" style={{ backgroundColor: !filtroCat ? 'var(--pos-secondary)' : 'var(--pos-bg)', color: !filtroCat ? '#fff' : 'var(--pos-text-muted)', border: `1px solid ${!filtroCat ? 'var(--pos-secondary)' : 'var(--pos-border)'}` }}>
            Todas
          </button>
          {categorias.map((c) => (
            <button key={c} onClick={() => setFiltroCat(filtroCat === c ? null : c)} className="shrink-0 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all" style={{ backgroundColor: filtroCat === c ? 'var(--pos-secondary)' : 'var(--pos-bg)', color: filtroCat === c ? '#fff' : 'var(--pos-text-muted)', border: `1px solid ${filtroCat === c ? 'var(--pos-secondary)' : 'var(--pos-border)'}` }}>
              {labelCategoria(c)}
            </button>
          ))}
        </div>
        {/* Estado */}
        <div className="flex gap-1.5">
          {(['todos', 'activos', 'inactivos'] as FiltroEstado[]).map((e) => (
            <button key={e} onClick={() => setFiltroEstado(e)} className="h-7 px-2.5 rounded-lg text-[11px] font-medium capitalize transition-all" style={{ backgroundColor: filtroEstado === e ? 'var(--pos-success)' : 'var(--pos-bg)', color: filtroEstado === e ? '#fff' : 'var(--pos-text-muted)', border: `1px solid ${filtroEstado === e ? 'var(--pos-success)' : 'var(--pos-border)'}` }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>No hay productos con estos filtros</p>
        </div>
      ) : (
        <div className="space-y-2">
          {productosFiltrados.map((prod) => (
            <div key={prod.id} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200" style={{ backgroundColor: 'var(--pos-card)', border: '1px solid var(--pos-border)', opacity: prod.activo ? 1 : 0.55 }}>
              {/* Toggle */}
              <button onClick={() => actualizarProducto(prod.id, { activo: !prod.activo })} className="w-10 h-6 rounded-full transition-all duration-200 relative shrink-0" style={{ backgroundColor: prod.activo ? 'var(--pos-success)' : 'var(--pos-border)' }}>
                <div className="absolute w-4 h-4 rounded-full bg-white top-1 transition-all duration-200 shadow-sm" style={{ left: prod.activo ? '22px' : '4px' }} />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {prod.esFavorito && <Star size={12} fill="var(--pos-warning)" style={{ color: 'var(--pos-warning)' }} />}
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--pos-text)' }}>{prod.nombre}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(192, 113, 74, 0.12)', color: 'var(--pos-primary)' }}>
                    {labelCategoria(prod.categoria)}
                  </span>
                  <span className="text-[10px] capitalize" style={{ color: 'var(--pos-text-muted)' }}>{prod.modo.join(', ')}</span>
                </div>
              </div>

              {/* Prices */}
              <div className="text-right shrink-0">
                <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>P: {formatearPrecio(prod.precioPension)}</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--pos-primary)' }}>R: {formatearPrecio(prod.precioRegular)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditingProduct(prod); setFormOpen(true) }} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ color: 'var(--pos-primary)' }}>
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(prod)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ color: 'var(--pos-danger)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      <FormProducto
        producto={editingProduct}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(undefined) }}
        onGuardar={handleGuardar}
      />
    </div>
  )
}
