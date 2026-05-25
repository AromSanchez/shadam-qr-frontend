'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Edit3, Trash2, Star } from 'lucide-react'
import type { Producto, ModoPension, CategoriaProducto } from '../../lib/types'
import { usePosContext } from '../../context/PosContext'
import { formatearPrecio } from '../../lib/utils'
import FormProducto from './FormProducto'

type FiltroEstado = 'todos' | 'activos' | 'inactivos'

interface BackendProduct {
  id: number
  nombre: string
  descripcion: string
  precio: string
  imagen: string
  categoria: string
}

interface BackendProductRelation {
  id: string
  menuId: string
  productoId: number
  visible: boolean
  producto: BackendProduct
}

export default function MenuEditor() {
  const { mostrarToast } = usePosContext()

  const [busqueda, setBusqueda] = useState('')
  const [filtroModo, setFiltroModo] = useState<ModoPension | null>(null)
  const [filtroCat, setFiltroCat] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [formOpen, setFormOpen] = useState(false)

  // Backend state
  const [menuId, setMenuId] = useState<string | null>(null)
  const [backendProducts, setBackendProducts] = useState<BackendProductRelation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMenu = async () => {
    try {
      setLoading(true)
      const res = await fetch('https://shadam-backend.onrender.com/menus')
      const data = await res.json()
      
      const activeMenu = data.find((m: any) => m.activo)
      if (activeMenu) {
        setMenuId(activeMenu.id)
        setBackendProducts(activeMenu.productos || [])
      } else {
        setMenuId(null)
        setBackendProducts([])
      }
    } catch (error) {
      console.error('Error fetching menus:', error)
      mostrarToast({ mensaje: 'Error al cargar el menú del backend', tipo: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const productosFiltrados = useMemo(() => {
    let result = [...backendProducts]
    // Filter by Category ('MENU' | 'ENTRADA')
    if (filtroCat) {
      result = result.filter((p) => p.producto.categoria.toUpperCase() === filtroCat.toUpperCase())
    }
    // Filter by state
    if (filtroEstado === 'activos') result = result.filter((p) => p.visible)
    if (filtroEstado === 'inactivos') result = result.filter((p) => !p.visible)
    // Filter by search
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter((p) => p.producto.nombre.toLowerCase().includes(q))
    }
    return result
  }, [backendProducts, filtroCat, filtroEstado, busqueda])

  const categorias = ['MENU', 'ENTRADA']

  const handleToggle = async (rel: BackendProductRelation) => {
    if (!menuId) return

    // Optimistic update
    setBackendProducts((prev) =>
      prev.map((p) => (p.id === rel.id ? { ...p, visible: !rel.visible } : p))
    )

    try {
      const res = await fetch(`https://shadam-backend.onrender.com/menus/${menuId}/productos/${rel.producto.id}/toggle`, {
        method: 'PATCH'
      })
      if (!res.ok) throw new Error('Error al cambiar visibilidad')
      
      mostrarToast({
        mensaje: !rel.visible ? `👁️ ${rel.producto.nombre} ahora es visible` : `🚫 ${rel.producto.nombre} ocultado`,
        tipo: 'success'
      })
    } catch (error) {
      // Revert on error
      setBackendProducts((prev) =>
        prev.map((p) => (p.id === rel.id ? { ...p, visible: rel.visible } : p))
      )
      mostrarToast({ mensaje: 'Error al actualizar visibilidad', tipo: 'error' })
    }
  }

  const handleDelete = (prod: BackendProductRelation) => {
    mostrarToast({ mensaje: 'Función no disponible temporalmente', tipo: 'info' })
  }

  const handleGuardar = (data: Producto | Omit<Producto, 'id'>) => {
    setFormOpen(false)
    mostrarToast({ mensaje: 'Función de agregar local desactivada', tipo: 'info' })
  }

  return (
    <div className="animate-fade-in p-4 space-y-4 pb-24 sm:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>Gestión de Menú</h2>
        <button
          onClick={() => setFormOpen(true)}
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
        {/* Category */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button onClick={() => setFiltroCat(null)} className="shrink-0 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all" style={{ backgroundColor: !filtroCat ? 'var(--pos-secondary)' : 'var(--pos-bg)', color: !filtroCat ? '#fff' : 'var(--pos-text-muted)', border: `1px solid ${!filtroCat ? 'var(--pos-secondary)' : 'var(--pos-border)'}` }}>
            Todas
          </button>
          {categorias.map((c) => (
            <button key={c} onClick={() => setFiltroCat(filtroCat === c ? null : c)} className="shrink-0 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all" style={{ backgroundColor: filtroCat === c ? 'var(--pos-secondary)' : 'var(--pos-bg)', color: filtroCat === c ? '#fff' : 'var(--pos-text-muted)', border: `1px solid ${filtroCat === c ? 'var(--pos-secondary)' : 'var(--pos-border)'}` }}>
              {c === 'MENU' ? 'Menú' : 'Entrada'}
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
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>Cargando menú...</p>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>No hay productos con estos filtros</p>
        </div>
      ) : (
        <div className="space-y-2">
          {productosFiltrados.map((rel) => {
            const prod = rel.producto
            return (
              <div key={rel.id} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200" style={{ backgroundColor: 'var(--pos-card)', border: '1px solid var(--pos-border)', opacity: rel.visible ? 1 : 0.55 }}>
                {/* Toggle */}
                <button onClick={() => handleToggle(rel)} className="w-10 h-6 rounded-full transition-all duration-200 relative shrink-0" style={{ backgroundColor: rel.visible ? 'var(--pos-success)' : 'var(--pos-border)' }}>
                  <div className="absolute w-4 h-4 rounded-full bg-white top-1 transition-all duration-200 shadow-sm" style={{ left: rel.visible ? '22px' : '4px' }} />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--pos-text)' }}>{prod.nombre}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase" style={{ backgroundColor: 'rgba(192, 113, 74, 0.12)', color: 'var(--pos-primary)' }}>
                      {prod.categoria}
                    </span>
                  </div>
                </div>

                {/* Prices */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--pos-primary)' }}>{formatearPrecio(Number(prod.precio || 0))}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleDelete(rel)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ color: 'var(--pos-danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form modal - Dummy usage to keep UI intact */}
      <FormProducto
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onGuardar={handleGuardar}
      />
    </div>
  )
}
