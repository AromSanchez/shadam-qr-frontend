'use client'

import { useState, useMemo, useCallback } from 'react'
import type { ItemPedido, Extra, Producto, TipoCliente, Pensionista } from '../../lib/types'
import { usePosContext } from '../../context/PosContext'
import { generarId, esGrupoExclusivo } from '../../lib/utils'
import HeaderPedido from './HeaderPedido'
import GrillaProductos from './GrillaProductos'
import SeccionExtras from './SeccionExtras'
import CarritoPanel from './CarritoPanel'
import PantallaExito from './PantallaExito'

interface PantallaPedidoProps {
  mesaId: string
  tipoCliente: TipoCliente
  pensionista?: Pensionista
  onVolver: () => void
  onPedidoConfirmado: () => void
  /** When provided, items are collected locally instead of creating a pedido in context */
  onItemsReady?: (items: ItemPedido[], extras: Extra[], total: number) => void
}

export default function PantallaPedido({ mesaId, tipoCliente, pensionista, onVolver, onPedidoConfirmado, onItemsReady }: PantallaPedidoProps) {
  const { state, crearPedidoAsync, mostrarToast } = usePosContext()
  const { mesas, productos, pedidos, modoActual } = state

  const mesa = mesas.find((m) => m.id === mesaId)
  const mesaNumero = mesa?.numero ?? mesaId

  const [items, setItems] = useState<ItemPedido[]>([])
  const [extras, setExtras] = useState<Extra[]>([])
  const [exito, setExito] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // Verify no duplicate order (skip for código collect mode)
  const pedidoExistente = pedidos.find((p) => p.mesaId === mesaId && p.estado === 'activo')

  // Breakfast exclusive group logic
  const grupoCaldoActivo = useMemo((): 'caldo' | 'normal' | null => {
    if (modoActual !== 'desayuno') return null
    for (const item of items) {
      const grupo = esGrupoExclusivo(item.producto.categoria)
      if (grupo) return grupo
    }
    return null
  }, [items, modoActual])

  const esPensionista = tipoCliente !== 'regular'

  const total = useMemo(() => {
    const prodTotal = items.reduce((s, i) => {
      const p = esPensionista ? i.producto.precioPension : i.producto.precioRegular
      return s + p * i.cantidad
    }, 0)
    const extrasTotal = extras.reduce((s, e) => s + e.monto, 0)
    return prodTotal + extrasTotal
  }, [items, extras, esPensionista])

  const agregarItem = useCallback((producto: Producto, paraLlevar: boolean) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.producto.id === producto.id && i.paraLlevar === paraLlevar)
      if (existing) {
        return prev.map((i) => i.id === existing.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { id: generarId(), producto, cantidad: 1, paraLlevar }]
    })
  }, [])

  const quitarItem = useCallback((itemId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === itemId)
      if (!item) return prev
      if (item.cantidad <= 1) return prev.filter((i) => i.id !== itemId)
      return prev.map((i) => i.id === itemId ? { ...i, cantidad: i.cantidad - 1 } : i)
    })
  }, [])

  const toggleParaLlevar = useCallback((itemId: string) => {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, paraLlevar: !i.paraLlevar } : i))
  }, [])

  const agregarExtra = useCallback((extra: Omit<Extra, 'id'>) => {
    setExtras((prev) => [...prev, { ...extra, id: generarId() }])
  }, [])

  const eliminarExtra = useCallback((id: string) => {
    setExtras((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleConfirmar = useCallback(async () => {
    if (items.length === 0) {
      mostrarToast({ mensaje: 'Agrega al menos un producto', tipo: 'warning' })
      return
    }

    // ── Collect mode: return items to parent without creating pedido ──
    if (onItemsReady) {
      onItemsReady(items, extras, total)
      return
    }

    // ── Normal mode: create pedido via backend API ──
    if (pedidoExistente && mesaId !== 'para_llevar') {
      mostrarToast({ mensaje: 'Esta mesa ya tiene un pedido activo', tipo: 'error' })
      return
    }

    if (esPensionista && pensionista && total > pensionista.saldo) {
      mostrarToast({ mensaje: 'Saldo insuficiente. Pedido registrado y se notificara al administrador.', tipo: 'warning', duracion: 4000 })
    }

    setEnviando(true)
    const mesasUnidas = mesa?.unidaCon || []
    try {
      const pedidoId = await crearPedidoAsync({
        mesaId,
        mesasUnidas,
        items,
        extras,
        total,
        modo: modoActual,
        tipo: tipoCliente,
        pensionistas: pensionista ? [{ ...pensionista, pedidoConfirmado: true, itemsPedido: items, extras }] : undefined,
        estado: 'activo',
      })
      setEnviando(false)
      if (pedidoId) {
        mostrarToast({ mensaje: 'Pedido registrado correctamente', tipo: 'success' })
      } else {
        mostrarToast({ mensaje: 'Pedido guardado localmente (sin conexion al servidor)', tipo: 'warning' })
      }
      setExito(true)
    } catch (err: unknown) {
      setEnviando(false)
      const mensaje = err instanceof Error ? err.message : 'Error al registrar el pedido'
      mostrarToast({ mensaje, tipo: 'error', duracion: 5000 })
    }
  }, [items, extras, total, mesaId, mesa, modoActual, tipoCliente, pensionista, crearPedidoAsync, mostrarToast, pedidoExistente, esPensionista, onItemsReady])

  if (exito) {
    return (
      <PantallaExito
        mesaNumero={mesaNumero}
        modo={modoActual}
        itemsCount={items.reduce((s, i) => s + i.cantidad, 0)}
        esPensionista={esPensionista}
        onEscanearSiguiente={onPedidoConfirmado}
        onNuevoPedido={onPedidoConfirmado}
      />
    )
  }

  // Button label changes for collect mode
  const confirmLabel = onItemsReady ? '📋 Agregar pedido' : undefined

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--pos-bg)' }}>
      <HeaderPedido
        mesaNumero={mesaNumero}
        modo={modoActual}
        tipoCliente={tipoCliente}
        nombreCliente={pensionista?.nombre}
        tipoP={pensionista?.tipo}
        saldo={pensionista?.saldo}
        onVolver={onVolver}
      />

      {/* Products grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-nav-safe sm:pb-4">
        <GrillaProductos
          productos={productos}
          modo={modoActual}
          tipoCliente={tipoCliente}
          items={items}
          grupoCaldoActivo={grupoCaldoActivo}
          onAgregarItem={agregarItem}
          onQuitarItem={quitarItem}
        />

        {/* Extras */}
        <div className="mt-4">
          <SeccionExtras
            extras={extras}
            onAgregarExtra={agregarExtra}
            onEliminarExtra={eliminarExtra}
          />
        </div>
      </div>

      {/* Cart */}
      <CarritoPanel
        items={items}
        extras={extras}
        tipoCliente={tipoCliente}
        saldoPensionista={pensionista?.saldo}
        confirmLabel={enviando ? 'Enviando...' : confirmLabel}
        onQuitarItem={quitarItem}
        onToggleParaLlevar={toggleParaLlevar}
        onCancelar={onVolver}
        onConfirmar={handleConfirmar}
        disabled={enviando}
      />
    </div>
  )
}
