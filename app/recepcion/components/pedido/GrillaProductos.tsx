'use client'

import { useMemo, useState } from 'react'
import { Search, Star } from 'lucide-react'
import type { Producto, ItemPedido, ModoPension, TipoCliente, CategoriaProducto } from '../../lib/types'
import { esGrupoExclusivo, labelCategoria } from '../../lib/utils'
import ProductoCard from './ProductoCard'

interface GrillaProductosProps {
  productos: Producto[]
  modo: ModoPension
  tipoCliente: TipoCliente
  items: ItemPedido[]
  grupoCaldoActivo: 'caldo' | 'normal' | null
  onAgregarItem: (producto: Producto, paraLlevar: boolean) => void
  onQuitarItem: (itemId: string) => void
}

// Category order per mode
const categoriasOrden: Record<ModoPension, CategoriaProducto[]> = {
  desayuno: ['bebida', 'acompañamiento', 'caldo'],
  almuerzo: ['refresco', 'entrada', 'segundo'],
  cena: ['sopa', 'infusion', 'plato_ligero'],
}

export default function GrillaProductos({
  productos, modo, tipoCliente, items, grupoCaldoActivo, onAgregarItem, onQuitarItem,
}: GrillaProductosProps) {
  const [busqueda, setBusqueda] = useState('')
  const [soloFavoritos, setSoloFavoritos] = useState(false)

  const productosModo = useMemo(
    () => productos.filter((p) => p.activo && p.modo.includes(modo)),
    [productos, modo]
  )

  const productosFiltrados = useMemo(() => {
    let result = productosModo
    if (soloFavoritos) result = result.filter((p) => p.esFavorito)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter((p) => p.nombre.toLowerCase().includes(q))
    }
    return result
  }, [productosModo, soloFavoritos, busqueda])

  // Group by category
  const categorias = categoriasOrden[modo].filter((cat) =>
    productosFiltrados.some((p) => p.categoria === cat)
  )
  // Also include 'otro' if any
  if (productosFiltrados.some((p) => p.categoria === 'otro')) {
    categorias.push('otro')
  }

  const getCantidad = (productoId: string): number => {
    return items.filter((i) => i.producto.id === productoId).reduce((sum, i) => sum + i.cantidad, 0)
  }

  const getItemId = (productoId: string): string | undefined => {
    return items.find((i) => i.producto.id === productoId)?.id
  }

  const esDeshabilitado = (producto: Producto): boolean => {
    if (modo !== 'desayuno') return false
    const grupo = esGrupoExclusivo(producto.categoria)
    if (!grupo || !grupoCaldoActivo) return false
    return grupo !== grupoCaldoActivo
  }

  return (
    <div className="space-y-4">
      {/* Search + favorites */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--pos-text-muted)' }} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-sm transition-all duration-150 outline-none"
            style={{
              backgroundColor: 'var(--pos-card)',
              border: '1px solid var(--pos-border)',
              color: 'var(--pos-text)',
            }}
          />
        </div>
        <button
          onClick={() => setSoloFavoritos(!soloFavoritos)}
          className="h-10 px-3 rounded-xl text-xs font-medium flex items-center gap-1 transition-all duration-150"
          style={{
            backgroundColor: soloFavoritos ? 'var(--pos-warning-bg)' : 'var(--pos-card)',
            border: `1px solid ${soloFavoritos ? 'var(--pos-warning)' : 'var(--pos-border)'}`,
            color: soloFavoritos ? 'var(--pos-warning)' : 'var(--pos-text-muted)',
          }}
        >
          <Star size={14} fill={soloFavoritos ? 'var(--pos-warning)' : 'none'} />
          Favoritos
        </button>
      </div>

      {/* Exclusive group warning for breakfast */}
      {modo === 'desayuno' && grupoCaldoActivo && (
        <div className="text-xs px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--pos-warning-bg)', color: 'var(--pos-warning)' }}>
          ℹ️ {grupoCaldoActivo === 'caldo' ? 'Caldos seleccionados — bebidas y acompañamientos deshabilitados' : 'Bebidas/acompañamientos seleccionados — caldos deshabilitados'}
        </div>
      )}

      {/* Categories */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>No se encontraron productos</p>
        </div>
      ) : (
        categorias.map((cat) => {
          const prodsCategoria = productosFiltrados.filter((p) => p.categoria === cat)
          if (prodsCategoria.length === 0) return null
          return (
            <div key={cat}>
              <h3 className="font-heading text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--pos-text-muted)' }}>
                {labelCategoria(cat)}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {prodsCategoria.map((prod) => (
                  <ProductoCard
                    key={prod.id}
                    producto={prod}
                    cantidad={getCantidad(prod.id)}
                    deshabilitado={esDeshabilitado(prod)}
                    tipoCliente={tipoCliente}
                    onAgregarAqui={() => onAgregarItem(prod, false)}
                    onAgregarParaLlevar={() => onAgregarItem(prod, true)}
                    onQuitar={() => {
                      const itemId = getItemId(prod.id)
                      if (itemId) onQuitarItem(itemId)
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
