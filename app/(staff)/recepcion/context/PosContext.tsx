'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import type { Mesa, Pedido, Producto, ModoPension, Toast } from '../lib/types'
import { mesasIniciales, productosIniciales } from '../lib/mock-data'
import { detectarModo, generarId, generarNumeroPedido } from '../lib/utils'

// ─── State ───
interface PosState {
  mesas: Mesa[]
  pedidos: Pedido[]
  productos: Producto[]
  modoActual: ModoPension
  darkMode: boolean
  toasts: Toast[]
}

// ─── Actions ───
type PosAction =
  | { type: 'SET_MESAS'; payload: Mesa[] }
  | { type: 'UPDATE_MESA'; payload: { id: string; cambios: Partial<Mesa> } }
  | { type: 'SET_PEDIDOS'; payload: Pedido[] }
  | { type: 'ADD_PEDIDO'; payload: Pedido }
  | { type: 'UPDATE_PEDIDO'; payload: { id: string; cambios: Partial<Pedido> } }
  | { type: 'FINALIZAR_PEDIDO'; payload: string }
  | { type: 'ELIMINAR_PEDIDO'; payload: string }
  | { type: 'SET_PRODUCTOS'; payload: Producto[] }
  | { type: 'UPDATE_PRODUCTO'; payload: { id: string; cambios: Partial<Producto> } }
  | { type: 'ADD_PRODUCTO'; payload: Producto }
  | { type: 'DELETE_PRODUCTO'; payload: string }
  | { type: 'SET_MODO'; payload: ModoPension }
  | { type: 'TOGGLE_DARK' }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }

function posReducer(state: PosState, action: PosAction): PosState {
  switch (action.type) {
    case 'SET_MESAS':
      return { ...state, mesas: action.payload }
    case 'UPDATE_MESA':
      return {
        ...state,
        mesas: state.mesas.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload.cambios } : m
        ),
      }
    case 'SET_PEDIDOS':
      return { ...state, pedidos: action.payload }
    case 'ADD_PEDIDO':
      return { ...state, pedidos: [...state.pedidos, action.payload] }
    case 'UPDATE_PEDIDO':
      return {
        ...state,
        pedidos: state.pedidos.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.cambios } : p
        ),
      }
    case 'FINALIZAR_PEDIDO': {
      const pedido = state.pedidos.find((p) => p.id === action.payload)
      if (!pedido) return state
      const mesasALiberar = [pedido.mesaId, ...pedido.mesasUnidas]
      return {
        ...state,
        pedidos: state.pedidos.map((p) =>
          p.id === action.payload ? { ...p, estado: 'finalizado' as const } : p
        ),
        mesas: state.mesas.map((m) =>
          mesasALiberar.includes(m.id)
            ? { ...m, estado: 'libre' as const, pedidoActualId: undefined, unidaCon: [] }
            : m
        ),
      }
    }
    case 'ELIMINAR_PEDIDO': {
      const pedido = state.pedidos.find((p) => p.id === action.payload)
      if (!pedido) return state
      const mesasALiberar = [pedido.mesaId, ...pedido.mesasUnidas]
      return {
        ...state,
        pedidos: state.pedidos.filter((p) => p.id !== action.payload),
        mesas: state.mesas.map((m) =>
          mesasALiberar.includes(m.id)
            ? { ...m, estado: 'libre' as const, pedidoActualId: undefined }
            : m
        ),
      }
    }
    case 'SET_PRODUCTOS':
      return { ...state, productos: action.payload }
    case 'UPDATE_PRODUCTO':
      return {
        ...state,
        productos: state.productos.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.cambios } : p
        ),
      }
    case 'ADD_PRODUCTO':
      return { ...state, productos: [...state.productos, action.payload] }
    case 'DELETE_PRODUCTO':
      return { ...state, productos: state.productos.filter((p) => p.id !== action.payload) }
    case 'SET_MODO':
      return { ...state, modoActual: action.payload }
    case 'TOGGLE_DARK':
      return { ...state, darkMode: !state.darkMode }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) }
    default:
      return state
  }
}

// ─── Context shape ───
interface PosContextValue {
  state: PosState
  actualizarMesa: (id: string, cambios: Partial<Mesa>) => void
  unirMesas: (idPrincipal: string, idsSecundarias: string[]) => void
  separarMesas: (idPrincipal: string) => void
  crearPedido: (pedido: Omit<Pedido, 'id' | 'numeroPedido' | 'creadoEn'>) => string
  actualizarPedido: (id: string, cambios: Partial<Pedido>) => void
  finalizarPedido: (id: string) => void
  eliminarPedido: (id: string) => void
  actualizarProducto: (id: string, cambios: Partial<Producto>) => void
  agregarProducto: (producto: Omit<Producto, 'id'>) => void
  eliminarProducto: (id: string) => void
  toggleDarkMode: () => void
  refrescarModo: () => void
  mostrarToast: (toast: Omit<Toast, 'id'>) => void
}

const PosContext = createContext<PosContextValue | null>(null)

// ─── Provider ───
export function PosProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(posReducer, {
    mesas: mesasIniciales,
    pedidos: [],
    productos: productosIniciales,
    modoActual: detectarModo(),
    darkMode: false,
    toasts: [],
  })

  const initialized = useRef(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      const savedDark = localStorage.getItem('pos_dark_mode')
      if (savedDark === 'true') dispatch({ type: 'TOGGLE_DARK' })

      const savedProductos = localStorage.getItem('pos_productos')
      if (savedProductos) {
        dispatch({ type: 'SET_PRODUCTOS', payload: JSON.parse(savedProductos) })
      }
      const savedPedidos = localStorage.getItem('pos_pedidos')
      if (savedPedidos) {
        const parsed = JSON.parse(savedPedidos).map((p: Pedido) => ({
          ...p,
          creadoEn: new Date(p.creadoEn),
        }))
        dispatch({ type: 'SET_PEDIDOS', payload: parsed })
        // Restore mesa states from active orders
        for (const pedido of parsed) {
          if (pedido.estado === 'activo') {
            dispatch({ type: 'UPDATE_MESA', payload: { id: pedido.mesaId, cambios: { estado: 'ocupado', pedidoActualId: pedido.id } } })
            for (const mid of pedido.mesasUnidas) {
              dispatch({ type: 'UPDATE_MESA', payload: { id: mid, cambios: { estado: 'ocupado', pedidoActualId: pedido.id } } })
            }
          }
        }
      }
    } catch { /* ignore corrupt localStorage */ }
  }, [])

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem('pos_dark_mode', String(state.darkMode))
    document.documentElement.classList.toggle('dark', state.darkMode)
  }, [state.darkMode])

  // Persist pedidos
  useEffect(() => {
    if (!initialized.current) return
    localStorage.setItem('pos_pedidos', JSON.stringify(state.pedidos))
  }, [state.pedidos])

  // Persist productos
  useEffect(() => {
    if (!initialized.current) return
    localStorage.setItem('pos_productos', JSON.stringify(state.productos))
  }, [state.productos])

  // Refresh modo every minute
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'SET_MODO', payload: detectarModo() })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // ─── Actions ───
  const actualizarMesa = useCallback((id: string, cambios: Partial<Mesa>) => {
    dispatch({ type: 'UPDATE_MESA', payload: { id, cambios } })
  }, [])

  const unirMesas = useCallback((idPrincipal: string, idsSecundarias: string[]) => {
    const principal = state.mesas.find((m) => m.id === idPrincipal)
    if (!principal) return
    // max 3 total
    const totalMesas = 1 + idsSecundarias.length + (principal.unidaCon?.length || 0)
    if (totalMesas > 3) return

    // Principal accumulates all secondary IDs
    dispatch({
      type: 'UPDATE_MESA',
      payload: {
        id: idPrincipal,
        cambios: { unidaCon: [...(principal.unidaCon || []), ...idsSecundarias] },
      },
    })
    // Secondaries do NOT point back — they keep unidaCon=[] to avoid circular refs
    for (const id of idsSecundarias) {
      dispatch({
        type: 'UPDATE_MESA',
        payload: {
          id,
          cambios: { unidaCon: [], estado: principal.estado },
        },
      })
    }
  }, [state.mesas])

  const separarMesas = useCallback((idPrincipal: string) => {
    const principal = state.mesas.find((m) => m.id === idPrincipal)
    if (!principal) return
    const todas = [idPrincipal, ...(principal.unidaCon || [])]
    for (const id of todas) {
      dispatch({
        type: 'UPDATE_MESA',
        payload: {
          id,
          cambios: { estado: 'libre', unidaCon: [], pedidoActualId: undefined },
        },
      })
    }
    // Finalize any active order on this group
    const pedido = state.pedidos.find((p) => p.mesaId === idPrincipal && p.estado === 'activo')
    if (pedido) {
      dispatch({ type: 'UPDATE_PEDIDO', payload: { id: pedido.id, cambios: { estado: 'finalizado' } } })
    }
  }, [state.mesas, state.pedidos])

  const crearPedido = useCallback((data: Omit<Pedido, 'id' | 'numeroPedido' | 'creadoEn'>) => {
    const id = generarId()
    const numeroPedido = generarNumeroPedido()
    const pedido: Pedido = { ...data, id, numeroPedido, creadoEn: new Date() }
    dispatch({ type: 'ADD_PEDIDO', payload: pedido })
    // Mark mesa(s) as occupied
    dispatch({ type: 'UPDATE_MESA', payload: { id: data.mesaId, cambios: { estado: 'ocupado', pedidoActualId: id } } })
    for (const mid of data.mesasUnidas) {
      dispatch({ type: 'UPDATE_MESA', payload: { id: mid, cambios: { estado: 'ocupado', pedidoActualId: id } } })
    }
    return id
  }, [])

  const actualizarPedido = useCallback((id: string, cambios: Partial<Pedido>) => {
    dispatch({ type: 'UPDATE_PEDIDO', payload: { id, cambios } })
  }, [])

  const finalizarPedido = useCallback((id: string) => {
    dispatch({ type: 'FINALIZAR_PEDIDO', payload: id })
  }, [])

  const eliminarPedido = useCallback((id: string) => {
    dispatch({ type: 'ELIMINAR_PEDIDO', payload: id })
  }, [])

  const actualizarProducto = useCallback((id: string, cambios: Partial<Producto>) => {
    dispatch({ type: 'UPDATE_PRODUCTO', payload: { id, cambios } })
  }, [])

  const agregarProducto = useCallback((producto: Omit<Producto, 'id'>) => {
    dispatch({ type: 'ADD_PRODUCTO', payload: { ...producto, id: generarId() } })
  }, [])

  const eliminarProducto = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PRODUCTO', payload: id })
  }, [])

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK' })
  }, [])

  const refrescarModo = useCallback(() => {
    dispatch({ type: 'SET_MODO', payload: detectarModo() })
  }, [])

  const mostrarToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generarId()
    dispatch({ type: 'ADD_TOAST', payload: { ...toast, id } })
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id })
    }, toast.duracion || 3000)
  }, [])

  const value: PosContextValue = {
    state,
    actualizarMesa,
    unirMesas,
    separarMesas,
    crearPedido,
    actualizarPedido,
    finalizarPedido,
    eliminarPedido,
    actualizarProducto,
    agregarProducto,
    eliminarProducto,
    toggleDarkMode,
    refrescarModo,
    mostrarToast,
  }

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>
}

export function usePosContext(): PosContextValue {
  const ctx = useContext(PosContext)
  if (!ctx) throw new Error('usePosContext must be used within PosProvider')
  return ctx
}
