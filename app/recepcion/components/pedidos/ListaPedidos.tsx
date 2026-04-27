'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, CreditCard, Check, Clock, PackageOpen, Edit3, Trash2 } from 'lucide-react'
import type { Pedido, ItemPedido, Extra } from '../../lib/types'
import { formatearPrecio } from '../../lib/utils'
import { usePosContext } from '../../context/PosContext'
import ModalPago from './ModalPago'
import ModalEditarPedido from './ModalEditarPedido'

export default function ListaPedidos() {
  const { state, finalizarPedido, eliminarPedido, actualizarPedido, mostrarToast } = usePosContext()
  const pedidosActivos = state.pedidos
    .filter((p) => p.estado === 'activo')
    .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())

  const [expandido, setExpandido] = useState<string | null>(null)
  const [pagoModal, setPagoModal] = useState<Pedido | null>(null)
  const [editModal, setEditModal] = useState<Pedido | null>(null)

  const tiempoTranscurrido = (fecha: Date): string => {
    const mins = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins} min`
    return `hace ${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const handlePagar = (pedido: Pedido) => {
    finalizarPedido(pedido.id)
    setPagoModal(null)
    mostrarToast({ mensaje: `✅ Pago registrado · Mesa liberada`, tipo: 'success' })
  }

  const handleFinalizar = (pedido: Pedido) => {
    finalizarPedido(pedido.id)
    mostrarToast({ mensaje: `✅ Pedido finalizado · Mesa liberada`, tipo: 'success' })
  }

  const handleGuardarEdicion = (cambios: { items: ItemPedido[]; extras: Extra[]; total: number }) => {
    if (!editModal) return
    actualizarPedido(editModal.id, cambios)
    mostrarToast({ mensaje: `✏️ Pedido #${editModal.numeroPedido} actualizado`, tipo: 'success' })
    setEditModal(null)
  }

  const handleEliminar = (pedido: Pedido) => {
    const mesaLabel = pedido.mesaId === 'para_llevar' ? 'Para llevar' : `Mesa ${pedido.mesaId.replace('mesa-', '')}`
    eliminarPedido(pedido.id)
    mostrarToast({ mensaje: `🗑️ Pedido #${pedido.numeroPedido} eliminado · ${mesaLabel} liberada`, tipo: 'warning' })
    setExpandido(null)
  }

  if (pedidosActivos.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-full p-8 text-center">
        <Clock size={48} style={{ color: 'var(--pos-border)' }} />
        <h3 className="font-heading text-lg font-semibold mt-4" style={{ color: 'var(--pos-text-muted)' }}>Sin pedidos activos</h3>
        <p className="text-sm" style={{ color: 'var(--pos-text-muted)', opacity: 0.6 }}>Los pedidos confirmados aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in p-4 space-y-3 pb-24 sm:pb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>
          Pedidos activos
        </h2>
        <span className="text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ backgroundColor: 'var(--pos-primary)' }}>
          {pedidosActivos.length}
        </span>
      </div>

      {pedidosActivos.map((pedido) => {
        const isExpanded = expandido === pedido.id
        const mainNum = pedido.mesaId.replace('mesa-', '')
        const mergedNums = pedido.mesasUnidas && pedido.mesasUnidas.length > 0
          ? pedido.mesasUnidas.map((id) => id.replace('mesa-', '')).join('-')
          : ''
        const mesaNum = pedido.mesaId === 'para_llevar'
          ? 'Para llevar'
          : `Mesa ${mainNum}${mergedNums ? '-' + mergedNums : ''}`
        const mesaShort = pedido.mesaId === 'para_llevar' ? null : `M${mainNum}${mergedNums ? '-' + mergedNums : ''}`
        const esPensionista = pedido.tipo !== 'regular'

        return (
          <div key={pedido.id} className="rounded-2xl overflow-hidden transition-all duration-200" style={{ backgroundColor: 'var(--pos-card)', border: '1px solid var(--pos-border)' }}>
            {/* Header — always visible */}
            <button onClick={() => setExpandido(isExpanded ? null : pedido.id)} className="w-full p-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--pos-warning-bg)' }}>
                  {pedido.mesaId === 'para_llevar' ? (
                    <PackageOpen size={18} style={{ color: 'var(--pos-warning)' }} />
                  ) : (
                    <span className="text-[9px] font-bold leading-tight text-center" style={{ color: 'var(--pos-warning)' }}>
                      {mesaShort}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--pos-text)' }}>{mesaNum}</h3>
                    <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Pedido #{pedido.numeroPedido}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: 'var(--pos-danger-bg)', color: 'var(--pos-danger)' }}>
                      🔴 Ocupado
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--pos-text-muted)' }}>{tiempoTranscurrido(pedido.creadoEn)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(212, 149, 106, 0.12)', color: 'var(--pos-secondary)' }}>
                      {esPensionista ? '🎓 Pensionista' : '👤 Regular'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <span className="font-heading text-sm font-bold" style={{ color: 'var(--pos-primary)' }}>{formatearPrecio(pedido.total)}</span>
                {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--pos-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--pos-text-muted)' }} />}
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="px-4 pb-4 animate-fade-in" style={{ borderTop: '1px solid var(--pos-border)' }}>
                <div className="pt-3 space-y-1.5">
                  {/* ── Pensionista grouped view ── */}
                  {esPensionista && pedido.pensionistas && pedido.pensionistas.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium" style={{ color: 'var(--pos-text-muted)' }}>
                        🟣 Pensionistas ({pedido.pensionistas.length})
                      </p>
                      {pedido.pensionistas.map((pens) => {
                        const pensTotal = pens.itemsPedido.reduce((s, i) => s + i.producto.precioPension * i.cantidad, 0)
                          + (pens.extras?.reduce((s, e) => s + e.monto, 0) || 0)
                        return (
                          <div
                            key={pens.id}
                            className="rounded-lg overflow-hidden"
                            style={{
                              backgroundColor: 'var(--pos-bg)',
                              borderLeft: '3px solid var(--pos-primary)',
                              border: '1px solid var(--pos-border)',
                              borderLeftWidth: '3px',
                              borderLeftColor: 'var(--pos-primary)',
                            }}
                          >
                            {/* Pensionista header */}
                            <div className="flex items-center justify-between px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--pos-primary)' }}>
                                  {pens.nombre.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-heading text-xs font-bold" style={{ color: 'var(--pos-text)' }}>
                                    {pens.nombre}
                                  </p>
                                  <p className="text-[10px] capitalize" style={{ color: 'var(--pos-text-muted)' }}>
                                    {pens.tipo} · {pens.codigo}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-bold" style={{ color: 'var(--pos-primary)' }}>
                                {formatearPrecio(pensTotal)}
                              </span>
                            </div>
                            {/* Items */}
                            <div className="px-3 pb-2 space-y-0.5">
                              {pens.itemsPedido.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--pos-text)' }}>
                                    {item.cantidad}× {item.producto.nombre}
                                    {item.paraLlevar && ' 🥡'}
                                  </span>
                                  <span style={{ color: 'var(--pos-text-muted)' }}>
                                    {formatearPrecio(item.producto.precioPension * item.cantidad)}
                                  </span>
                                </div>
                              ))}
                              {pens.extras && pens.extras.length > 0 && pens.extras.map((e) => (
                                <div key={e.id} className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--pos-text-muted)' }}>+ {e.descripcion}</span>
                                  <span style={{ color: 'var(--pos-warning)' }}>{formatearPrecio(e.monto)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    /* ── Regular flat item list ── */
                    <>
                      {pedido.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(192, 113, 74, 0.12)', color: 'var(--pos-primary)' }}>
                              {item.cantidad}
                            </span>
                            <span style={{ color: 'var(--pos-text)' }}>{item.producto.nombre}</span>
                            {item.paraLlevar && <span className="text-[10px] px-1 rounded" style={{ backgroundColor: 'var(--pos-warning-bg)', color: 'var(--pos-warning)' }}>🥡</span>}
                          </div>
                          <span style={{ color: 'var(--pos-text-muted)' }}>
                            {formatearPrecio((esPensionista ? item.producto.precioPension : item.producto.precioRegular) * item.cantidad)}
                          </span>
                        </div>
                      ))}

                      {pedido.extras.length > 0 && (
                        <div className="pt-1" style={{ borderTop: '1px dashed var(--pos-border)' }}>
                          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--pos-text-muted)' }}>Extras</p>
                          {pedido.extras.map((e) => (
                            <div key={e.id} className="flex justify-between text-xs py-0.5">
                              <span style={{ color: 'var(--pos-text-muted)' }}>{e.descripcion}</span>
                              <span style={{ color: 'var(--pos-warning)' }}>{formatearPrecio(e.monto)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between pt-2 text-sm font-bold" style={{ borderTop: '1px solid var(--pos-border)' }}>
                    <span style={{ color: 'var(--pos-text)' }}>Total</span>
                    <span style={{ color: 'var(--pos-primary)' }}>{formatearPrecio(pedido.total)}</span>
                  </div>
                </div>

                {/* Action buttons — Edit + Pay/Finalize */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setEditModal(pedido)}
                    className="h-12 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{ border: '2px solid var(--pos-primary)', color: 'var(--pos-primary)' }}
                  >
                    <Edit3 size={16} /> Editar
                  </button>
                  {esPensionista ? (
                    <button
                      onClick={() => handleFinalizar(pedido)}
                      className="flex-1 h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      style={{ backgroundColor: 'var(--pos-success)' }}
                    >
                      <Check size={16} /> Finalizar pedido
                    </button>
                  ) : (
                    <button
                      onClick={() => setPagoModal(pedido)}
                      className="flex-1 h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      style={{ backgroundColor: 'var(--pos-success)' }}
                    >
                      <CreditCard size={16} /> Pagar
                    </button>
                  )}
                </div>

                {/* Danger zone — delete */}
                <button
                  onClick={() => handleEliminar(pedido)}
                  className="w-full h-10 mt-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  style={{ border: '1px solid var(--pos-danger)', color: 'var(--pos-danger)' }}
                >
                  <Trash2 size={13} /> Eliminar pedido
                </button>
              </div>
            )}
          </div>
        )
      })}

      {pagoModal && (
        <ModalPago
          pedido={pagoModal}
          open={!!pagoModal}
          onClose={() => setPagoModal(null)}
          onPagado={() => handlePagar(pagoModal)}
        />
      )}

      {editModal && (
        <ModalEditarPedido
          pedido={editModal}
          open={!!editModal}
          onClose={() => setEditModal(null)}
          onGuardar={handleGuardarEdicion}
        />
      )}
    </div>
  )
}
