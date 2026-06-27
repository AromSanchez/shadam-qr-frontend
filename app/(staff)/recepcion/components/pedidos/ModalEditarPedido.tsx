'use client'

import { useState, useMemo } from 'react'
import { X, Plus, Minus, Trash2, PackageOpen, Save } from 'lucide-react'
import type { Pedido, ItemPedido, Extra, Pensionista } from '../../lib/types'
import { formatearPrecio, generarId } from '../../lib/utils'

interface ModalEditarPedidoProps {
  pedido: Pedido
  open: boolean
  onClose: () => void
  onGuardar: (cambios: { items: ItemPedido[]; extras: Extra[]; total: number; pensionistas?: Pensionista[] }) => void
}

export default function ModalEditarPedido({ pedido, open, onClose, onGuardar }: ModalEditarPedidoProps) {
  const hasPensionistas = pedido.pensionistas && pedido.pensionistas.length > 0

  // For pensionista_codigo: track items per pensionista
  const [pensionistasState, setPensionistasState] = useState<Pensionista[]>(() =>
    hasPensionistas ? pedido.pensionistas!.map((p) => ({ ...p, itemsPedido: p.itemsPedido.map((i) => ({ ...i })), extras: (p.extras || []).map((e) => ({ ...e })) })) : []
  )

  // For regular orders: flat item list
  const [items, setItems] = useState<ItemPedido[]>(() => pedido.items.map((i) => ({ ...i })))
  const [extras, setExtras] = useState<Extra[]>(() => pedido.extras.map((e) => ({ ...e })))
  const [nuevoExtraDesc, setNuevoExtraDesc] = useState('')
  const [nuevoExtraMonto, setNuevoExtraMonto] = useState('')

  const esPensionista = pedido.tipo !== 'regular'

  // ── Pensionista item handlers ──
  const cambiarCantidadPens = (pensId: string, itemId: string, delta: number) => {
    setPensionistasState((prev) =>
      prev.map((p) =>
        p.id === pensId
          ? { ...p, itemsPedido: p.itemsPedido.map((i) => i.id === itemId ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i) }
          : p
      )
    )
  }

  const eliminarItemPens = (pensId: string, itemId: string) => {
    setPensionistasState((prev) =>
      prev.map((p) =>
        p.id === pensId
          ? { ...p, itemsPedido: p.itemsPedido.filter((i) => i.id !== itemId) }
          : p
      )
    )
  }

  const toggleParaLlevarPens = (pensId: string, itemId: string) => {
    setPensionistasState((prev) =>
      prev.map((p) =>
        p.id === pensId
          ? { ...p, itemsPedido: p.itemsPedido.map((i) => i.id === itemId ? { ...i, paraLlevar: !i.paraLlevar } : i) }
          : p
      )
    )
  }

  // ── Regular item handlers ──
  const cambiarCantidad = (id: string, delta: number) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item))
  }
  const eliminarItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }
  const toggleParaLlevar = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, paraLlevar: !item.paraLlevar } : item))
  }

  // ── Extras ──
  const eliminarExtra = (id: string) => { setExtras((prev) => prev.filter((e) => e.id !== id)) }
  const agregarExtra = () => {
    if (!nuevoExtraDesc.trim() || !nuevoExtraMonto.trim()) return
    const monto = parseFloat(nuevoExtraMonto)
    if (isNaN(monto) || monto <= 0) return
    setExtras((prev) => [...prev, { id: generarId(), descripcion: nuevoExtraDesc.trim(), monto }])
    setNuevoExtraDesc('')
    setNuevoExtraMonto('')
  }

  // ── Total calculation ──
  const total = useMemo(() => {
    if (hasPensionistas) {
      const pensTotal = pensionistasState.reduce((sum, p) => {
        const pItems = p.itemsPedido.reduce((s, i) => s + i.producto.precioPension * i.cantidad, 0)
        const pExtras = (p.extras || []).reduce((s, e) => s + e.monto, 0)
        return sum + pItems + pExtras
      }, 0)
      const extrasTotal = extras.reduce((s, e) => s + e.monto, 0)
      return pensTotal + extrasTotal
    }
    const itemsTotal = items.reduce((sum, item) => {
      const precio = esPensionista ? item.producto.precioPension : item.producto.precioRegular
      return sum + precio * item.cantidad
    }, 0)
    return itemsTotal + extras.reduce((s, e) => s + e.monto, 0)
  }, [items, extras, esPensionista, hasPensionistas, pensionistasState])

  const handleGuardar = () => {
    if (hasPensionistas) {
      const allItems = pensionistasState.flatMap((p) => p.itemsPedido)
      if (allItems.length === 0) return
      const allExtras = [...extras, ...pensionistasState.flatMap((p) => p.extras || [])]
      onGuardar({ items: allItems, extras: allExtras, total, pensionistas: pensionistasState })
    } else {
      if (items.length === 0) return
      onGuardar({ items, extras, total })
    }
  }

  // Shared item row component
  const renderItemRow = (
    item: ItemPedido,
    precio: number,
    onCambiar: (delta: number) => void,
    onToggle: () => void,
    onEliminar: () => void,
  ) => (
    <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: 'var(--pos-bg)', border: '1px solid var(--pos-border)' }}>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => onCambiar(-1)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pos-danger-bg)', color: 'var(--pos-danger)' }}>
          <Minus size={12} />
        </button>
        <span className="w-6 text-center text-sm font-bold" style={{ color: 'var(--pos-text)' }}>{item.cantidad}</span>
        <button onClick={() => onCambiar(1)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pos-success-bg)', color: 'var(--pos-success)' }}>
          <Plus size={12} />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--pos-text)' }}>{item.producto.nombre}</p>
        <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>{formatearPrecio(precio * item.cantidad)}</p>
      </div>
      <button onClick={onToggle} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all" style={{
        backgroundColor: item.paraLlevar ? 'var(--pos-warning-bg)' : 'transparent',
        color: item.paraLlevar ? 'var(--pos-warning)' : 'var(--pos-text-muted)',
        border: `1px solid ${item.paraLlevar ? 'var(--pos-warning)' : 'var(--pos-border)'}`,
      }} title={item.paraLlevar ? 'Para llevar' : 'Aquí'}>
        <PackageOpen size={14} />
      </button>
      <button onClick={onEliminar} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ color: 'var(--pos-danger)' }}>
        <Trash2 size={14} />
      </button>
    </div>
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="pos-modal-overlay absolute inset-0" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85vh] rounded-t-[24px] sm:rounded-[24px] flex flex-col animate-slide-up mb-20 sm:mb-0"
        style={{
          backgroundColor: 'var(--pos-card)',
          boxShadow: 'var(--pos-shadow-xl)',
          border: '1px solid var(--pos-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 shrink-0" style={{ borderBottom: '1px solid var(--pos-border)' }}>
          <div>
            <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>Editar pedido</h2>
            <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Pedido #{pedido.numeroPedido}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: 'var(--pos-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {hasPensionistas ? (
            /* ── Grouped by pensionista ── */
            <div className="space-y-4">
              <p className="text-xs font-medium" style={{ color: 'var(--pos-text-muted)' }}>
                🟣 Pensionistas ({pensionistasState.length})
              </p>
              {pensionistasState.map((pens) => {
                const pensTotal = pens.itemsPedido.reduce((s, i) => s + i.producto.precioPension * i.cantidad, 0)
                return (
                  <div
                    key={pens.id}
                    className="rounded-xl overflow-hidden"
                    style={{
                      border: '1px solid var(--pos-border)',
                      borderLeft: '3px solid var(--pos-primary)',
                    }}
                  >
                    {/* Pensionista header */}
                    <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--pos-bg)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ backgroundColor: 'var(--pos-primary)' }}>
                          {pens.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-heading text-sm font-bold" style={{ color: 'var(--pos-text)' }}>{pens.nombre}</p>
                          <p className="text-[10px] capitalize" style={{ color: 'var(--pos-text-muted)' }}>{pens.tipo} · {pens.codigo}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold" style={{ color: 'var(--pos-primary)' }}>
                        {formatearPrecio(pensTotal)}
                      </span>
                    </div>
                    {/* Items for this pensionista */}
                    <div className="px-3 pb-3 space-y-2">
                      {pens.itemsPedido.length === 0 ? (
                        <p className="text-xs text-center py-2" style={{ color: 'var(--pos-text-muted)' }}>Sin ítems</p>
                      ) : (
                        pens.itemsPedido.map((item) =>
                          renderItemRow(
                            item,
                            item.producto.precioPension,
                            (delta) => cambiarCantidadPens(pens.id, item.id, delta),
                            () => toggleParaLlevarPens(pens.id, item.id),
                            () => eliminarItemPens(pens.id, item.id),
                          )
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* ── Regular flat item list ── */
            <div>
              <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--pos-text-muted)' }}>Ítems ({items.length})</h3>
              {items.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--pos-text-muted)' }}>No hay ítems</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const precio = esPensionista ? item.producto.precioPension : item.producto.precioRegular
                    return renderItemRow(
                      item,
                      precio,
                      (delta) => cambiarCantidad(item.id, delta),
                      () => toggleParaLlevar(item.id),
                      () => eliminarItem(item.id),
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Extras */}
          <div>
            <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--pos-text-muted)' }}>Extras / Cobros adicionales</h3>
            {extras.map((extra) => (
              <div key={extra.id} className="flex items-center justify-between py-1.5 text-sm">
                <span style={{ color: 'var(--pos-text)' }}>{extra.descripcion}</span>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--pos-warning)' }}>{formatearPrecio(extra.monto)}</span>
                  <button onClick={() => eliminarExtra(extra.id)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--pos-danger)' }}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={nuevoExtraDesc} onChange={(e) => setNuevoExtraDesc(e.target.value)} placeholder="Descripción" className="flex-1 h-9 px-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--pos-card)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }} />
              <input value={nuevoExtraMonto} onChange={(e) => setNuevoExtraMonto(e.target.value)} placeholder="S/" type="number" className="w-20 h-9 px-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--pos-card)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }} />
              <button onClick={agregarExtra} className="h-9 px-3 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: 'var(--pos-primary)' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 shrink-0" style={{ borderTop: '1px solid var(--pos-border)' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="font-heading text-sm font-semibold" style={{ color: 'var(--pos-text)' }}>Total</span>
            <span className="font-heading text-lg font-bold" style={{ color: 'var(--pos-primary)' }}>{formatearPrecio(total)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 h-12 rounded-xl font-semibold text-sm" style={{ border: '2px solid var(--pos-border)', color: 'var(--pos-text-muted)' }}>
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={hasPensionistas ? pensionistasState.every((p) => p.itemsPedido.length === 0) : items.length === 0}
              className="flex-1 h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ backgroundColor: 'var(--pos-primary)' }}
            >
              <Save size={16} /> Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
