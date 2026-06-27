'use client'

import { useMemo, useState } from 'react'
import { Search, Star, Info } from 'lucide-react'
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

const categoriasOrden: Record<ModoPension, CategoriaProducto[]> = {
  desayuno: ['bebida', 'acompañamiento', 'caldo', 'entrada', 'segundo'],
  almuerzo: ['refresco', 'entrada', 'segundo', 'sopa'],
  cena: ['sopa', 'infusion', 'plato_ligero', 'entrada', 'segundo'],
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

  const categorias = categoriasOrden[modo].filter((cat) =>
    productosFiltrados.some((p) => p.categoria === cat)
  )
  if (productosFiltrados.some((p) => p.categoria === 'otro')) {
    categorias.push('otro')
  }

  const getCantidad = (productoId: string): number =>
    items.filter((i) => i.producto.id === productoId).reduce((sum, i) => sum + i.cantidad, 0)

  const getItemId = (productoId: string): string | undefined =>
    items.find((i) => i.producto.id === productoId)?.id

  const esDeshabilitado = (producto: Producto): boolean => {
    if (modo !== 'desayuno') return false
    const grupo = esGrupoExclusivo(producto.categoria)
    if (!grupo || !grupoCaldoActivo) return false
    return grupo !== grupoCaldoActivo
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Search + Favorites bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            size={15}
            style={{ color: 'var(--pos-text-disabled)' }}
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            className="pos-input w-full h-11 pl-9 pr-4 text-sm"
            style={{ borderRadius: 'var(--pos-radius-lg)' }}
          />
        </div>

        {/* Favorites toggle */}
        <button
          onClick={() => setSoloFavoritos(!soloFavoritos)}
          className="pos-btn h-11 px-3 rounded-[var(--pos-radius-lg)] gap-1.5 text-xs font-semibold shrink-0"
          style={{
            backgroundColor: soloFavoritos ? 'var(--pos-warning-bg)' : 'var(--pos-surface-2)',
            border: `1.5px solid ${soloFavoritos ? 'var(--pos-warning-border)' : 'var(--pos-border)'}`,
            color: soloFavoritos ? 'var(--pos-warning)' : 'var(--pos-text-muted)',
          }}
          aria-pressed={soloFavoritos}
          aria-label="Mostrar solo favoritos"
        >
          <Star
            size={14}
            fill={soloFavoritos ? 'var(--pos-warning)' : 'none'}
            style={{ transition: 'fill 0.2s ease' }}
          />
          <span className="hidden sm:inline">Favoritos</span>
        </button>
      </div>

      {/* Exclusive group notice (breakfast mode) */}
      {modo === 'desayuno' && grupoCaldoActivo && (
        <div
          className="flex items-start gap-2.5 px-3 py-2.5 rounded-[var(--pos-radius-md)] text-xs"
          style={{
            backgroundColor: 'var(--pos-warning-bg)',
            color: 'var(--pos-warning)',
            border: '1px solid var(--pos-warning-border)',
          }}
        >
          <Info size={13} className="shrink-0 mt-0.5" />
          <span style={{ fontFamily: 'Outfit, sans-serif', lineHeight: '1.4' }}>
            {grupoCaldoActivo === 'caldo'
              ? 'Caldo seleccionado — bebidas y acompañamientos deshabilitados'
              : 'Bebida/acompañamiento seleccionado — caldos deshabilitados'}
          </span>
        </div>
      )}

      {/* Category sections */}
      {productosFiltrados.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-14 rounded-[var(--pos-radius-xl)] gap-3"
          style={{ backgroundColor: 'var(--pos-surface-2)' }}
        >
          <Search size={28} style={{ color: 'var(--pos-text-disabled)' }} />
          <p className="text-sm" style={{ color: 'var(--pos-text-muted)', fontFamily: 'Outfit, sans-serif' }}>
            No se encontraron productos
          </p>
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="text-xs underline"
              style={{ color: 'var(--pos-primary)' }}
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        categorias.map((cat) => {
          const prodsCategoria = productosFiltrados.filter((p) => p.categoria === cat)
          if (prodsCategoria.length === 0) return null
          return (
            <section key={cat}>
              {/* Category label */}
              <div className="flex items-center gap-2 mb-2.5">
                <h3
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{
                    color: 'var(--pos-text-disabled)',
                    fontFamily: 'Poppins, sans-serif',
                    letterSpacing: '0.08em',
                  }}
                >
                  {labelCategoria(cat)}
                </h3>
                <div
                  className="flex-1 h-px"
                  style={{ backgroundColor: 'var(--pos-divider)' }}
                />
                <span
                  className="text-[10px]"
                  style={{ color: 'var(--pos-text-disabled)', fontFamily: 'Outfit, sans-serif' }}
                >
                  {prodsCategoria.length}
                </span>
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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
            </section>
          )
        })
      )}
    </div>
  )
}
