'use client'

import { useState, useEffect } from 'react'
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Check,
  Clock,
  PackageOpen,
  Edit3,
  Trash2,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react'
import type { Pedido, ItemPedido, Extra, MetodoPago } from '../../lib/types'
import { formatearPrecio } from '../../lib/utils'
import { usePosContext } from '../../context/PosContext'
import ModalPago from './ModalPago'
import ModalEditarPedido from './ModalEditarPedido'

export default function ListaPedidos() {
  const { state, finalizarPedido, eliminarPedido, eliminarPedidoAsync, actualizarPedido, actualizarPedidoAsync, pagarPedido, mostrarToast } = usePosContext()

  // BUG FIX: Sort oldest-first so most urgent orders appear at the top
  const pedidosActivos = state.pedidos
    .filter((p) => p.estado === 'activo')
    .sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime())

  const [expandido, setExpandido] = useState<string | null>(null)
  const [pagoModal, setPagoModal] = useState<Pedido | null>(null)
  const [editModal, setEditModal] = useState<Pedido | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── Time helpers ──────────────────────────────────────────────
  const getMinutos = (fecha: Date): number =>
    Math.floor((now - new Date(fecha).getTime()) / 60000)

  const tiempoTranscurrido = (fecha: Date): string => {
    const mins = getMinutos(fecha)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins}m`
    return `hace ${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`
  }

  const tiempoColor = (fecha: Date): string => {
    const mins = getMinutos(fecha)
    if (mins < 15) return 'var(--pos-success)'
    if (mins < 30) return 'var(--pos-warning)'
    return 'var(--pos-danger)'
  }

  const tiempoBg = (fecha: Date): string => {
    const mins = getMinutos(fecha)
    if (mins < 15) return 'var(--pos-success-bg)'
    if (mins < 30) return 'var(--pos-warning-bg)'
    return 'var(--pos-danger-bg)'
  }

  // ── Handlers ─────────────────────────────────────────────────
  // Pagar pedido via backend API (POST /pedidos/:id/pagar) - converts to venta
  const handlePagar = async (pedido: Pedido, metodo: MetodoPago) => {
    setPagoModal(null)
    const metodoLabel = metodo === 'efectivo' ? 'Efectivo' : 'Yape'
    const success = await pagarPedido(pedido.id, metodo, pedido.total)
    if (success) {
      mostrarToast({ mensaje: `Pago por ${metodoLabel} registrado - Venta creada - Mesa liberada`, tipo: 'success' })
    } else {
      mostrarToast({ mensaje: `Pago por ${metodoLabel} registrado localmente (sin conexion al servidor)`, tipo: 'warning' })
    }
  }

  // Finalizar pedido pensionista (no requiere pago monetario - consume saldo)
  const handleFinalizar = async (pedido: Pedido) => {
    // Consume balance from pensionista if they have an ID
    if (pedido.pensionistas && pedido.pensionistas.length > 0) {
      for (const pens of pedido.pensionistas) {
        if (pens.id && pedido.total > 0) {
          try {
            await fetch(`/api/proxy?path=${encodeURIComponent(`/users/${pens.id}/consume`)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: pedido.total, description: `Pedido #${pedido.numeroPedido}` }),
            })
          } catch { /* consume failed - continue anyway */ }
        }
      }
    }
    // Confirm the order in the backend
    try {
      const { confirmarPedidoAPI } = await import('@/lib/pedidos-api')
      await confirmarPedidoAPI(pedido.id)
    } catch { /* fallback to local */ }
    finalizarPedido(pedido.id)
    mostrarToast({ mensaje: `Pedido finalizado - Saldo consumido - Mesa liberada`, tipo: 'success' })
  }

  // Editar pedido via backend API (PATCH /pedidos/:id)
  const handleGuardarEdicion = async (cambios: { items: ItemPedido[]; extras: Extra[]; total: number }) => {
    if (!editModal) return
    const success = await actualizarPedidoAsync(editModal.id, cambios)
    if (success) {
      mostrarToast({ mensaje: `Pedido #${editModal.numeroPedido} actualizado`, tipo: 'success' })
    } else {
      mostrarToast({ mensaje: `Pedido #${editModal.numeroPedido} actualizado localmente`, tipo: 'warning' })
    }
    setEditModal(null)
  }

  // Eliminar pedido via backend API (DELETE /pedidos/:id)
  const handleEliminar = async (pedido: Pedido) => {
    const mesaLabel =
      pedido.mesaId === 'para_llevar' ? 'Para llevar' : `Mesa ${pedido.mesaId.replace('mesa-', '')}`
    await eliminarPedidoAsync(pedido.id)
    mostrarToast({
      mensaje: `Pedido #${pedido.numeroPedido} eliminado - ${mesaLabel} liberada`,
      tipo: 'warning',
    })
    setExpandido(null)
  }

  // ── Empty state ───────────────────────────────────────────────
  if (pedidosActivos.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-full p-10 text-center gap-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--pos-surface-2)', border: '1px solid var(--pos-border)' }}
        >
          <ShoppingBag size={32} style={{ color: 'var(--pos-text-muted)', opacity: 0.5 }} />
        </div>
        <div>
          <h3
            className="font-heading text-base font-semibold mb-1"
            style={{ color: 'var(--pos-text-muted)' }}
          >
            Sin pedidos activos
          </h3>
          <p className="text-sm" style={{ color: 'var(--pos-text-disabled)' }}>
            Los pedidos confirmados aparecerán aquí en orden de llegada
          </p>
        </div>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <div className="animate-fade-in p-4 space-y-2.5 pb-24 sm:pb-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-heading text-base font-bold" style={{ color: 'var(--pos-text)' }}>
          Pedidos activos
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium" style={{ color: 'var(--pos-text-muted)' }}>
            más antiguos primero
          </span>
          <span
            className="min-w-[24px] h-6 px-2 rounded-lg text-xs font-bold text-white flex items-center justify-center"
            style={{ backgroundColor: 'var(--pos-primary)' }}
          >
            {pedidosActivos.length}
          </span>
        </div>
      </div>

      {pedidosActivos.map((pedido, index) => {
        const isExpanded = expandido === pedido.id
        const mainNum = pedido.mesaId.replace('mesa-', '')
        const mergedNums =
          pedido.mesasUnidas && pedido.mesasUnidas.length > 0
            ? pedido.mesasUnidas.map((id) => id.replace('mesa-', '')).join('-')
            : ''
        const mesaNum =
          pedido.mesaId === 'para_llevar'
            ? 'Para llevar'
            : `Mesa ${mainNum}${mergedNums ? '-' + mergedNums : ''}`
        const mesaShort =
          pedido.mesaId === 'para_llevar' ? null : `M${mainNum}${mergedNums ? '-' + mergedNums : ''}`
        const esPensionista = pedido.tipo !== 'regular'
        const urgencyColor = tiempoColor(pedido.creadoEn)
        const urgencyBg = tiempoBg(pedido.creadoEn)

        return (
          <div
            key={pedido.id}
            className="rounded-[20px] overflow-hidden transition-all duration-200"
            style={{
              backgroundColor: 'var(--pos-card)',
              border: '1px solid var(--pos-border)',
              boxShadow: isExpanded ? 'var(--pos-shadow-md)' : 'var(--pos-shadow-sm)',
            }}
          >
            {/* ── Card header — always visible ── */}
            <button
              onClick={() => setExpandido(isExpanded ? null : pedido.id)}
              className="w-full p-4 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.02] active:scale-[0.995]"
            >
              {/* Mesa icon / number */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: urgencyBg, border: `1.5px solid ${urgencyColor}30` }}
              >
                {pedido.mesaId === 'para_llevar' ? (
                  <PackageOpen size={18} style={{ color: urgencyColor }} />
                ) : (
                  <span
                    className="font-heading text-[9px] font-bold leading-tight text-center"
                    style={{ color: urgencyColor }}
                  >
                    {mesaShort}
                  </span>
                )}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                {/* Row 1: mesa name + order number */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-sm font-semibold leading-tight"
                    style={{ color: 'var(--pos-text)' }}
                  >
                    {mesaNum}
                  </span>
                  <span
                    className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{
                      backgroundColor: 'var(--pos-surface-2)',
                      color: 'var(--pos-text-muted)',
                    }}
                  >
                    #{pedido.numeroPedido}
                  </span>
                </div>
                {/* Row 2: time elapsed + customer type */}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: urgencyBg, color: urgencyColor }}
                  >
                    <Clock size={9} />
                    {tiempoTranscurrido(pedido.creadoEn)}
                  </span>
                  {esPensionista ? (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}
                    >
                      Pensionista
                    </span>
                  ) : (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: 'var(--pos-surface-2)',
                        color: 'var(--pos-text-muted)',
                      }}
                    >
                      Regular
                    </span>
                  )}
                </div>
              </div>

              {/* Price + chevron */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="font-heading text-sm font-bold text-tabular"
                  style={{ color: 'var(--pos-primary)' }}
                >
                  {formatearPrecio(pedido.total)}
                </span>
                <div
                  className="transition-transform duration-200"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <ChevronDown size={16} style={{ color: 'var(--pos-text-muted)' }} />
                </div>
              </div>
            </button>

            {/* ── Expanded detail ── */}
            {isExpanded && (
              <div
                className="px-4 pb-4 animate-fade-in"
                style={{ borderTop: '1px solid var(--pos-border)' }}
              >
                <div className="pt-3 space-y-1.5">
                  {/* ── Pensionista grouped view ── */}
                  {esPensionista && pedido.pensionistas && pedido.pensionistas.length > 0 ? (
                    <div className="space-y-3">
                      <p
                        className="text-[10px] uppercase tracking-wider font-semibold"
                        style={{ color: 'var(--pos-text-muted)' }}
                      >
                        Pensionistas ({pedido.pensionistas.length})
                      </p>
                      {pedido.pensionistas.map((pens) => {
                        const pensTotal =
                          pens.itemsPedido.reduce(
                            (s, i) => s + i.producto.precioPension * i.cantidad,
                            0
                          ) + (pens.extras?.reduce((s, e) => s + e.monto, 0) || 0)
                        return (
                          <div
                            key={pens.id}
                            className="rounded-xl overflow-hidden"
                            style={{
                              backgroundColor: 'var(--pos-bg)',
                              border: '1px solid var(--pos-border)',
                              borderLeft: '3px solid #A78BFA',
                            }}
                          >
                            {/* Pensionista header */}
                            <div className="flex items-center justify-between px-3 py-2.5">
                              <div className="flex items-center gap-2.5">
                                {/* Initials avatar */}
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: '#A78BFA' }}
                                >
                                  {pens.nombre
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((w) => w.charAt(0))
                                    .join('')
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <p
                                    className="font-heading text-xs font-bold"
                                    style={{ color: 'var(--pos-text)' }}
                                  >
                                    {pens.nombre}
                                  </p>
                                  <p
                                    className="text-[10px] capitalize"
                                    style={{ color: 'var(--pos-text-muted)' }}
                                  >
                                    {pens.tipo} · {pens.codigo}
                                  </p>
                                </div>
                              </div>
                              <span
                                className="text-xs font-bold text-tabular"
                                style={{ color: '#A78BFA' }}
                              >
                                {formatearPrecio(pensTotal)}
                              </span>
                            </div>
                            {/* Items */}
                            <div className="px-3 pb-2.5 space-y-0.5">
                              {pens.itemsPedido.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--pos-text)' }}>
                                    {item.cantidad}× {item.producto.nombre}
                                    {item.paraLlevar && (
                                      <span
                                        className="ml-1 text-[9px] px-1 py-0.5 rounded font-medium"
                                        style={{
                                          backgroundColor: 'var(--pos-warning-bg)',
                                          color: 'var(--pos-warning)',
                                        }}
                                      >
                                        llevar
                                      </span>
                                    )}
                                  </span>
                                  <span
                                    className="text-tabular"
                                    style={{ color: 'var(--pos-text-muted)' }}
                                  >
                                    {formatearPrecio(item.producto.precioPension * item.cantidad)}
                                  </span>
                                </div>
                              ))}
                              {pens.extras &&
                                pens.extras.length > 0 &&
                                pens.extras.map((e) => (
                                  <div key={e.id} className="flex justify-between text-xs">
                                    <span style={{ color: 'var(--pos-text-muted)' }}>
                                      + {e.descripcion}
                                    </span>
                                    <span
                                      className="text-tabular"
                                      style={{ color: 'var(--pos-warning)' }}
                                    >
                                      {formatearPrecio(e.monto)}
                                    </span>
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
                        <div
                          key={item.id}
                          className="flex justify-between items-center py-1 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[11px] font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: 'rgba(6,182,212,0.1)',
                                color: 'var(--pos-primary)',
                              }}
                            >
                              {item.cantidad}
                            </span>
                            <span style={{ color: 'var(--pos-text)' }}>
                              {item.producto.nombre}
                            </span>
                            {item.paraLlevar && (
                              <span
                                className="text-[9px] px-1 py-0.5 rounded font-medium"
                                style={{
                                  backgroundColor: 'var(--pos-warning-bg)',
                                  color: 'var(--pos-warning)',
                                }}
                              >
                                llevar
                              </span>
                            )}
                          </div>
                          <span
                            className="text-tabular text-xs"
                            style={{ color: 'var(--pos-text-muted)' }}
                          >
                            {formatearPrecio(
                              (esPensionista
                                ? item.producto.precioPension
                                : item.producto.precioRegular) * item.cantidad
                            )}
                          </span>
                        </div>
                      ))}

                      {pedido.extras.length > 0 && (
                        <div
                          className="pt-1.5 mt-0.5"
                          style={{ borderTop: '1px dashed var(--pos-divider)' }}
                        >
                          <p
                            className="text-[9px] uppercase tracking-widest mb-1.5 font-semibold"
                            style={{ color: 'var(--pos-text-muted)' }}
                          >
                            Extras
                          </p>
                          {pedido.extras.map((e) => (
                            <div key={e.id} className="flex justify-between text-xs py-0.5">
                              <span style={{ color: 'var(--pos-text-muted)' }}>
                                {e.descripcion}
                              </span>
                              <span
                                className="text-tabular"
                                style={{ color: 'var(--pos-warning)' }}
                              >
                                {formatearPrecio(e.monto)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Total row */}
                  <div
                    className="flex justify-between pt-2.5 mt-1 text-sm font-bold"
                    style={{ borderTop: '1px solid var(--pos-border)' }}
                  >
                    <span style={{ color: 'var(--pos-text-muted)' }}>Total</span>
                    <span className="text-tabular" style={{ color: 'var(--pos-primary)' }}>
                      {formatearPrecio(pedido.total)}
                    </span>
                  </div>
                </div>

                {/* ── Action buttons: Edit + Pay/Finalize ── */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setEditModal(pedido)}
                    className="touch-target px-5 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] active:translate-y-px"
                    style={{
                      border: '1.5px solid var(--pos-border-2)',
                      color: 'var(--pos-text-2)',
                      backgroundColor: 'var(--pos-surface-2)',
                    }}
                  >
                    <Edit3 size={15} />
                    Editar
                  </button>
                  {esPensionista ? (
                    <button
                      onClick={() => handleFinalizar(pedido)}
                      className="flex-1 touch-target rounded-xl text-white font-heading font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] active:translate-y-px"
                      style={{ backgroundColor: 'var(--pos-success)' }}
                    >
                      <Check size={16} />
                      Finalizar pedido
                    </button>
                  ) : (
                    <button
                      onClick={() => setPagoModal(pedido)}
                      className="flex-1 touch-target rounded-xl text-white font-heading font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] active:translate-y-px"
                      style={{ backgroundColor: 'var(--pos-success)' }}
                    >
                      <CreditCard size={16} />
                      Pagar
                    </button>
                  )}
                </div>

                {/* ── Danger: delete ── */}
                <button
                  onClick={() => handleEliminar(pedido)}
                  className="w-full h-9 mt-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] hover:bg-red-500/5"
                  style={{ color: 'var(--pos-danger)', border: '1px solid var(--pos-danger-border)' }}
                >
                  <Trash2 size={12} />
                  Eliminar pedido
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* ── Modals ── */}
      {pagoModal && (
        <ModalPago
          pedido={pagoModal}
          open={!!pagoModal}
          onClose={() => setPagoModal(null)}
          onPagado={(metodo) => handlePagar(pagoModal, metodo)}
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
