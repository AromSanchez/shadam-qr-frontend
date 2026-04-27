'use client'

import { useState, useCallback, useMemo } from 'react'
import { ArrowLeft, Search, UserPlus, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { Pensionista, TipoCliente, ItemPedido, Extra } from '../../lib/types'
import { pensionistasMock } from '../../lib/mock-data'
import { formatearPrecio } from '../../lib/utils'
import { usePosContext } from '../../context/PosContext'
import PantallaPedido from '../pedido/PantallaPedido'

interface IngresoCodigosMultiplesProps {
  mesaId: string
  onTodosConfirmados: () => void
  onVolver: () => void
}

/** Extended local state per pensionista — tracks their collected items */
interface PensionistaLocal extends Pensionista {
  itemsPedido: ItemPedido[]
  extras: Extra[]
  totalIndividual: number
}

export default function IngresoCodigosMultiples({ mesaId, onTodosConfirmados, onVolver }: IngresoCodigosMultiplesProps) {
  const { crearPedido, mostrarToast, state } = usePosContext()
  const [pensionistas, setPensionistas] = useState<PensionistaLocal[]>([])
  const [codigoActual, setCodigoActual] = useState('')
  const [error, setError] = useState('')
  const [pensionistaActivo, setPensionistaActivo] = useState<PensionistaLocal | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)

  const agregarCodigo = useCallback(() => {
    if (!codigoActual.trim()) return
    setError('')

    const found = pensionistasMock.find((p) => p.codigo.toLowerCase() === codigoActual.trim().toLowerCase())
    if (!found) {
      setError(`❌ Pensionista no encontrado: "${codigoActual}"`)
      mostrarToast({ mensaje: `Código "${codigoActual}" no encontrado`, tipo: 'error' })
      return
    }
    if (pensionistas.some((p) => p.id === found.id)) {
      setError('Ya fue agregado')
      return
    }
    setPensionistas((prev) => [
      ...prev,
      { ...found, pedidoConfirmado: false, itemsPedido: [], extras: [], totalIndividual: 0 },
    ])
    setCodigoActual('')
  }, [codigoActual, pensionistas, mostrarToast])

  const remover = useCallback((id: string) => {
    setPensionistas((prev) => prev.filter((p) => p.id !== id))
  }, [])

  /** Receives items from PantallaPedido in collect mode (no pedido created yet) */
  const handleItemsReady = useCallback((items: ItemPedido[], extras: Extra[], total: number) => {
    if (!pensionistaActivo) return
    setPensionistas((prev) =>
      prev.map((p) =>
        p.id === pensionistaActivo.id
          ? { ...p, pedidoConfirmado: true, itemsPedido: items, extras, totalIndividual: total }
          : p
      )
    )
    mostrarToast({ mensaje: `📋 Pedido de ${pensionistaActivo.nombre} agregado`, tipo: 'success' })
    setPensionistaActivo(null)
  }, [pensionistaActivo, mostrarToast])

  const todosConfirmados = pensionistas.length > 0 && pensionistas.every((p) => p.pedidoConfirmado)

  const totalGlobal = useMemo(
    () => pensionistas.reduce((sum, p) => sum + p.totalIndividual, 0),
    [pensionistas]
  )

  /** Creates ONE pedido with all pensionistas bundled */
  const handleConfirmarTodos = useCallback(() => {
    const mesa = state.mesas.find((m) => m.id === mesaId)
    const mesasUnidas = mesa?.unidaCon || []

    // Collect all items into a flat list for the pedido root
    const allItems = pensionistas.flatMap((p) => p.itemsPedido)
    const allExtras = pensionistas.flatMap((p) => p.extras)

    crearPedido({
      mesaId,
      mesasUnidas,
      items: allItems,
      extras: allExtras,
      total: totalGlobal,
      modo: state.modoActual,
      tipo: 'pensionista_codigo' as TipoCliente,
      pensionistas: pensionistas.map((p) => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        tipo: p.tipo,
        saldo: p.saldo,
        pedidoConfirmado: true,
        itemsPedido: p.itemsPedido,
        extras: p.extras,
      })),
      estado: 'activo',
    })

    mostrarToast({ mensaje: `✅ ${pensionistas.length} pedidos registrados en grupo`, tipo: 'success' })
    onTodosConfirmados()
  }, [pensionistas, totalGlobal, mesaId, state, crearPedido, mostrarToast, onTodosConfirmados])

  // ── Active pensionista order screen ──
  if (pensionistaActivo) {
    return (
      <PantallaPedido
        mesaId={mesaId}
        tipoCliente={'pensionista_codigo' as TipoCliente}
        pensionista={pensionistaActivo}
        onVolver={() => setPensionistaActivo(null)}
        onPedidoConfirmado={() => setPensionistaActivo(null)}
        onItemsReady={handleItemsReady}
      />
    )
  }

  // ── Main: code input + pensionista cards ──
  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ backgroundColor: 'var(--pos-bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--pos-border)', backgroundColor: 'var(--pos-card)' }}>
        <button onClick={onVolver} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--pos-text)' }}>Ingresar códigos</h2>
          <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
            Mesa {state.mesas.find((m) => m.id === mesaId)?.numero ?? mesaId}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Code input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--pos-text-muted)' }} />
            <input
              type="text"
              value={codigoActual}
              onChange={(e) => { setCodigoActual(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && agregarCodigo()}
              placeholder="Ej: ESC001, EXT002..."
              className="w-full h-12 pl-10 pr-4 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--pos-card)', border: '1px solid var(--pos-border)', color: 'var(--pos-text)' }}
            />
          </div>
          <button onClick={agregarCodigo} className="h-12 px-5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--pos-primary)' }}>
            <UserPlus size={16} /> Agregar
          </button>
        </div>

        {error && <p className="text-sm px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--pos-danger-bg)', color: 'var(--pos-danger)' }}>{error}</p>}

        <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
          Prueba: ESC001, ESC002, ESC003, EXT001, EXT002, EXT003, EXT004, ESC004
        </p>

        {/* Pensionista cards */}
        {pensionistas.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--pos-text-muted)' }}>
              Pensionistas ({pensionistas.length})
            </h3>
            {pensionistas.map((p) => {
              const isExpanded = expandido === p.id && p.pedidoConfirmado
              return (
                <div key={p.id} className="rounded-xl overflow-hidden transition-all duration-200" style={{
                  backgroundColor: p.pedidoConfirmado ? 'var(--pos-success-bg)' : 'var(--pos-card)',
                  border: `1.5px solid ${p.pedidoConfirmado ? 'var(--pos-success)' : 'var(--pos-border)'}`,
                }}>
                  {/* Card header */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (p.pedidoConfirmado) {
                        setExpandido(isExpanded ? null : p.id)
                      } else {
                        setPensionistaActivo(p)
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !p.pedidoConfirmado && setPensionistaActivo(p)}
                    className="w-full flex items-center justify-between p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: p.pedidoConfirmado ? 'var(--pos-success)' : 'var(--pos-primary)' }}>
                        {p.pedidoConfirmado ? <Check size={16} /> : p.nombre.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold" style={{ color: 'var(--pos-text)' }}>{p.nombre}</p>
                        <p className="text-xs capitalize" style={{ color: 'var(--pos-text-muted)' }}>
                          {p.tipo} · {p.codigo}
                          {p.pedidoConfirmado && ` · ${p.itemsPedido.length} ítem${p.itemsPedido.length !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.pedidoConfirmado ? (
                        <>
                          <span className="text-sm font-bold" style={{ color: 'var(--pos-success)' }}>
                            {formatearPrecio(p.totalIndividual)}
                          </span>
                          {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--pos-text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--pos-text-muted)' }} />}
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-bold" style={{ color: p.saldo > 0 ? 'var(--pos-success)' : 'var(--pos-danger)' }}>
                            {formatearPrecio(p.saldo)}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); remover(p.id) }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--pos-danger)' }}>
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded items list */}
                  {isExpanded && (
                    <div className="px-3 pb-3 animate-fade-in" style={{ borderTop: '1px solid var(--pos-border)' }}>
                      <div className="pt-2 space-y-1">
                        {p.itemsPedido.map((item) => (
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
                        {p.extras.map((e) => (
                          <div key={e.id} className="flex justify-between text-xs">
                            <span style={{ color: 'var(--pos-text-muted)' }}>+ {e.descripcion}</span>
                            <span style={{ color: 'var(--pos-warning)' }}>{formatearPrecio(e.monto)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom bar: total + confirm button */}
      {pensionistas.length > 0 && (
        <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--pos-border)', backgroundColor: 'var(--pos-card)' }}>
          {/* Summary */}
          {pensionistas.some((p) => p.pedidoConfirmado) && (
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--pos-text-muted)' }}>
                Total ({pensionistas.filter((p) => p.pedidoConfirmado).length}/{pensionistas.length} confirmados)
              </span>
              <span className="font-heading font-bold" style={{ color: 'var(--pos-primary)' }}>
                {formatearPrecio(totalGlobal)}
              </span>
            </div>
          )}

          {/* Confirm all */}
          {todosConfirmados && (
            <button
              onClick={handleConfirmarTodos}
              className="w-full h-14 rounded-xl text-white font-heading font-bold text-base transition-all duration-150 active:scale-[0.98] shadow-md"
              style={{ backgroundColor: 'var(--pos-success)' }}
            >
              ✅ Confirmar todos los pedidos ({pensionistas.length})
            </button>
          )}
        </div>
      )}
    </div>
  )
}
