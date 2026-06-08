'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import type { Mesa, Pedido, Producto, ModoPension, Toast, ItemPedido, Extra, MetodoPago, CategoriaProducto } from '../lib/types'
import { mesasIniciales, productosIniciales } from '../lib/mock-data'
import { detectarModo, generarId, generarNumeroPedido } from '../lib/utils'
import {
  crearPedidoAPI,
  listarPedidosAPI,
  actualizarPedidoAPI,
  eliminarPedidoAPI,
  confirmarPedidoAPI,
  pagarPedidoAPI,
  buildTableNumber,
  mapCustomerType,
  mapOrderType,
  type BackendPedido,
  type PaymentMethod as BackendPaymentMethod,
} from '@/lib/pedidos-api'
import { ApiError } from '@/lib/api'

// ─── State ───
interface PosState {
  mesas: Mesa[]
  pedidos: Pedido[]
  productos: Producto[]
  modoActual: ModoPension
  darkMode: boolean
  toasts: Toast[]
  cargandoPedidos: boolean
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
  | { type: 'SET_CARGANDO_PEDIDOS'; payload: boolean }

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
        pedidos: state.pedidos.filter((p) => p.id !== action.payload),
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
    case 'SET_CARGANDO_PEDIDOS':
      return { ...state, cargandoPedidos: action.payload }
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
  crearPedidoAsync: (pedido: Omit<Pedido, 'id' | 'numeroPedido' | 'creadoEn'>) => Promise<string | null>
  actualizarPedido: (id: string, cambios: Partial<Pedido>) => void
  actualizarPedidoAsync: (id: string, cambios: Partial<Pedido>) => Promise<boolean>
  finalizarPedido: (id: string) => void
  pagarPedido: (id: string, metodo: MetodoPago, monto: number) => Promise<boolean>
  eliminarPedido: (id: string) => void
  eliminarPedidoAsync: (id: string) => Promise<boolean>
  actualizarProducto: (id: string, cambios: Partial<Producto>) => void
  agregarProducto: (producto: Omit<Producto, 'id'>) => void
  eliminarProducto: (id: string) => void
  toggleDarkMode: () => void
  refrescarModo: () => void
  refrescarPedidos: () => Promise<void>
  mostrarToast: (toast: Omit<Toast, 'id'>) => void
  ocultarToast: (id: string) => void
}

const PosContext = createContext<PosContextValue | null>(null)

// ─── Helper: Convert backend pedido to frontend Pedido ───
function backendToFrontendPedido(bp: BackendPedido, productos: Producto[]): Pedido {
  const tableNumber = bp.tableNumber || ''
  const mesaNums = tableNumber.split('-').filter(Boolean)
  const mainMesaId = bp.type === 'PARA_LLEVAR' ? 'para_llevar' : `mesa-${mesaNums[0] || '0'}`
  const mesasUnidas = mesaNums.slice(1).map((n) => `mesa-${n}`)

  // Map backend items to frontend ItemPedido
  const items: ItemPedido[] = (bp.items || []).map((item) => {
    // Try to find the product in our local product list for full details
    const localProd = productos.find((p) => p.id === String(item.productoId))
    const producto: Producto = localProd || {
      id: String(item.productoId),
      nombre: item.producto?.nombre || `Producto ${item.productoId}`,
      precioPension: parseFloat(String(item.unitPrice)) || 0,
      precioRegular: parseFloat(String(item.unitPrice)) || 0,
      categoria: (item.producto?.categoria?.toLowerCase() || 'otro') as any,
      modo: ['desayuno', 'almuerzo', 'cena'],
      activo: true,
      esFavorito: false,
    }

    return {
      id: item.id || generarId(),
      producto,
      cantidad: item.quantity,
      paraLlevar: item.isTakeaway,
    }
  })

  return {
    id: bp.id,
    numeroPedido: parseInt(bp.id.slice(-4), 16) || Math.floor(Math.random() * 999),
    mesaId: mainMesaId,
    mesasUnidas,
    items,
    extras: [],
    total: parseFloat(String(bp.total)) || 0,
    modo: detectarModo(),
    tipo: bp.customerType === 'PENSIONER' ? 'pensionista_qr' : 'regular',
    creadoEn: new Date(bp.createdAt),
    estado: 'activo',
  }
}

// ─── Provider ───
export function PosProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(posReducer, {
    mesas: mesasIniciales,
    pedidos: [],
    productos: productosIniciales,
    modoActual: detectarModo(),
    darkMode: false,
    toasts: [],
    cargandoPedidos: false,
  })

  const initialized = useRef(false)
  const stateRef = useRef(state)
  stateRef.current = state

  // ─── Fetch pedidos from backend on mount ───
  const fetchPedidos = useCallback(async () => {
    dispatch({ type: 'SET_CARGANDO_PEDIDOS', payload: true })
    try {
      const backendPedidos = await listarPedidosAPI()
      const pedidos = backendPedidos.map((bp) => backendToFrontendPedido(bp, stateRef.current.productos))
      dispatch({ type: 'SET_PEDIDOS', payload: pedidos })

      // Update mesa states based on active pedidos
      // First, reset all mesas to libre
      for (const mesa of stateRef.current.mesas) {
        if (mesa.id !== 'para_llevar' && mesa.estado === 'ocupado') {
          dispatch({ type: 'UPDATE_MESA', payload: { id: mesa.id, cambios: { estado: 'libre', pedidoActualId: undefined } } })
        }
      }
      // Then mark occupied mesas
      for (const pedido of pedidos) {
        if (pedido.mesaId !== 'para_llevar') {
          dispatch({ type: 'UPDATE_MESA', payload: { id: pedido.mesaId, cambios: { estado: 'ocupado', pedidoActualId: pedido.id } } })
          for (const mid of pedido.mesasUnidas) {
            dispatch({ type: 'UPDATE_MESA', payload: { id: mid, cambios: { estado: 'ocupado', pedidoActualId: pedido.id } } })
          }
        }
      }
    } catch (err) {
      console.warn('[POS] Error fetching pedidos from backend, using local state:', err)
      // Fallback: load from localStorage if backend is unreachable
      try {
        const savedPedidos = localStorage.getItem('pos_pedidos')
        if (savedPedidos) {
          const parsed = JSON.parse(savedPedidos).map((p: Pedido) => ({
            ...p,
            creadoEn: new Date(p.creadoEn),
          }))
          dispatch({ type: 'SET_PEDIDOS', payload: parsed })
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
    } finally {
      dispatch({ type: 'SET_CARGANDO_PEDIDOS', payload: false })
    }
  }, [])

  // ─── Fetch products from active menu ───
  const fetchProductos = useCallback(async () => {
    try {
      const res = await fetch('/api/proxy?path=' + encodeURIComponent('/menus/actual'))
      if (!res.ok) {
        console.warn('[POS] No active menu found, using local products')
        return
      }
      const menu = await res.json()
      if (menu && menu.productos && menu.productos.length > 0) {
        const productos: Producto[] = menu.productos
          .filter((mp: any) => mp.visible)
          .map((mp: any) => {
            const p = mp.producto
            const precio = parseFloat(p.precio) || 0
            const backendCat = (p.categoria || '').toUpperCase()
            // Map backend categories to frontend display categories
            // Backend only has ENTRADA and MENU
            // ENTRADA -> 'entrada' (shown in almuerzo as starter)
            // MENU -> 'segundo' (shown in almuerzo as main course)
            // We make all products available in ALL meal modes so staff can always see them
            let categoria: CategoriaProducto = 'otro'
            if (backendCat === 'ENTRADA') categoria = 'entrada'
            else if (backendCat === 'MENU') categoria = 'segundo'

            return {
              id: String(p.id),
              nombre: p.nombre,
              precioPension: precio,
              precioRegular: precio,
              categoria,
              // Products from backend are available in ALL modes
              modo: ['desayuno', 'almuerzo', 'cena'] as ModoPension[],
              activo: true,
              esFavorito: false,
            }
          })
        dispatch({ type: 'SET_PRODUCTOS', payload: productos })
      }
    } catch (err) {
      console.warn('[POS] Error fetching menu products:', err)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    try {
      const savedDark = localStorage.getItem('pos_dark_mode')
      if (savedDark === 'true') dispatch({ type: 'TOGGLE_DARK' })
    } catch { /* ignore corrupt localStorage */ }

    // Fetch products from active menu and pedidos from backend
    fetchProductos()
    fetchPedidos()
  }, [fetchPedidos, fetchProductos])

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem('pos_dark_mode', String(state.darkMode))
    document.documentElement.classList.toggle('dark', state.darkMode)
  }, [state.darkMode])

  // Persist pedidos locally as backup
  useEffect(() => {
    if (!initialized.current) return
    localStorage.setItem('pos_pedidos', JSON.stringify(state.pedidos))
  }, [state.pedidos])

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
    const principal = stateRef.current.mesas.find((m) => m.id === idPrincipal)
    if (!principal) return
    const totalMesas = 1 + idsSecundarias.length + (principal.unidaCon?.length || 0)
    if (totalMesas > 3) return

    dispatch({
      type: 'UPDATE_MESA',
      payload: {
        id: idPrincipal,
        cambios: { unidaCon: [...(principal.unidaCon || []), ...idsSecundarias] },
      },
    })
    for (const id of idsSecundarias) {
      dispatch({
        type: 'UPDATE_MESA',
        payload: {
          id,
          cambios: { unidaCon: [], estado: principal.estado },
        },
      })
    }
  }, [])

  const separarMesas = useCallback((idPrincipal: string) => {
    const principal = stateRef.current.mesas.find((m) => m.id === idPrincipal)
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
    const pedido = stateRef.current.pedidos.find((p) => p.mesaId === idPrincipal && p.estado === 'activo')
    if (pedido) {
      dispatch({ type: 'UPDATE_PEDIDO', payload: { id: pedido.id, cambios: { estado: 'finalizado' } } })
    }
  }, [])

  // Synchronous crearPedido (legacy, for backward compat - also calls API in background)
  const crearPedido = useCallback((data: Omit<Pedido, 'id' | 'numeroPedido' | 'creadoEn'>) => {
    const id = generarId()
    const numeroPedido = generarNumeroPedido()
    const pedido: Pedido = { ...data, id, numeroPedido, creadoEn: new Date() }
    dispatch({ type: 'ADD_PEDIDO', payload: pedido })
    dispatch({ type: 'UPDATE_MESA', payload: { id: data.mesaId, cambios: { estado: 'ocupado', pedidoActualId: id } } })
    for (const mid of data.mesasUnidas) {
      dispatch({ type: 'UPDATE_MESA', payload: { id: mid, cambios: { estado: 'ocupado', pedidoActualId: id } } })
    }

    // Fire API call in background to sync with backend
    const apiData = {
      type: mapOrderType(data.mesaId),
      tableNumber: buildTableNumber(data.mesaId, data.mesasUnidas),
      customerType: mapCustomerType(data.tipo),
      items: data.items.map((item) => ({
        productoId: parseInt(item.producto.id) || 0,
        quantity: item.cantidad,
        isTakeaway: item.paraLlevar,
      })),
    }
    crearPedidoAPI(apiData)
      .then((backendPedido) => {
        // Update local pedido with backend ID for future operations
        dispatch({ type: 'UPDATE_PEDIDO', payload: { id, cambios: { id: backendPedido.id } as any } })
      })
      .catch((err) => {
        console.warn('[POS] Backend crearPedido failed (local state preserved):', err)
      })

    return id
  }, [])

  // Async crearPedido - awaits backend response
  const crearPedidoAsync = useCallback(async (data: Omit<Pedido, 'id' | 'numeroPedido' | 'creadoEn'>): Promise<string | null> => {
    try {
      const apiData = {
        type: mapOrderType(data.mesaId),
        tableNumber: buildTableNumber(data.mesaId, data.mesasUnidas),
        customerType: mapCustomerType(data.tipo),
        items: data.items.map((item) => ({
          productoId: parseInt(item.producto.id) || 0,
          quantity: item.cantidad,
          isTakeaway: item.paraLlevar,
        })),
      }

      const backendPedido = await crearPedidoAPI(apiData)

      // Create local pedido with backend ID
      const numeroPedido = generarNumeroPedido()
      const pedido: Pedido = {
        ...data,
        id: backendPedido.id,
        numeroPedido,
        creadoEn: new Date(backendPedido.createdAt),
      }
      dispatch({ type: 'ADD_PEDIDO', payload: pedido })
      dispatch({ type: 'UPDATE_MESA', payload: { id: data.mesaId, cambios: { estado: 'ocupado', pedidoActualId: backendPedido.id } } })
      for (const mid of data.mesasUnidas) {
        dispatch({ type: 'UPDATE_MESA', payload: { id: mid, cambios: { estado: 'ocupado', pedidoActualId: backendPedido.id } } })
      }

      return backendPedido.id
    } catch (err) {
      console.error('[POS] crearPedidoAsync failed:', err)
      return null
    }
  }, [])

  const actualizarPedido = useCallback((id: string, cambios: Partial<Pedido>) => {
    dispatch({ type: 'UPDATE_PEDIDO', payload: { id, cambios } })
  }, [])

  // Async update that calls the backend
  const actualizarPedidoAsync = useCallback(async (id: string, cambios: Partial<Pedido>): Promise<boolean> => {
    try {
      const updateData: any = {}
      if (cambios.items) {
        updateData.items = cambios.items.map((item) => ({
          productoId: parseInt(item.producto.id) || 0,
          quantity: item.cantidad,
          isTakeaway: item.paraLlevar,
        }))
      }
      await actualizarPedidoAPI(id, updateData)
      dispatch({ type: 'UPDATE_PEDIDO', payload: { id, cambios } })
      return true
    } catch (err) {
      console.error('[POS] actualizarPedidoAsync failed:', err)
      // Still update locally as fallback
      dispatch({ type: 'UPDATE_PEDIDO', payload: { id, cambios } })
      return false
    }
  }, [])

  const finalizarPedido = useCallback((id: string) => {
    dispatch({ type: 'FINALIZAR_PEDIDO', payload: id })
  }, [])

  // Pay pedido via API - converts to venta
  const pagarPedido = useCallback(async (id: string, metodo: MetodoPago, monto: number): Promise<boolean> => {
    try {
      const backendMethod: BackendPaymentMethod = metodo === 'efectivo' ? 'EFECTIVO' : 'YAPE'
      await pagarPedidoAPI(id, {
        payments: [{ method: backendMethod, amount: monto }],
      })
      // Payment successful - remove pedido from local state and free mesas
      dispatch({ type: 'FINALIZAR_PEDIDO', payload: id })
      return true
    } catch (err) {
      console.error('[POS] pagarPedido failed:', err)
      // If API fails, still finalize locally to not block the user
      dispatch({ type: 'FINALIZAR_PEDIDO', payload: id })
      return false
    }
  }, [])

  const eliminarPedido = useCallback((id: string) => {
    dispatch({ type: 'ELIMINAR_PEDIDO', payload: id })
    // Fire API call in background
    eliminarPedidoAPI(id).catch((err) => {
      console.warn('[POS] Backend eliminarPedido failed:', err)
    })
  }, [])

  // Async delete that awaits backend
  const eliminarPedidoAsync = useCallback(async (id: string): Promise<boolean> => {
    try {
      await eliminarPedidoAPI(id)
      dispatch({ type: 'ELIMINAR_PEDIDO', payload: id })
      return true
    } catch (err) {
      console.error('[POS] eliminarPedidoAsync failed:', err)
      // Still remove locally
      dispatch({ type: 'ELIMINAR_PEDIDO', payload: id })
      return false
    }
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

  const refrescarPedidos = useCallback(async () => {
    await fetchPedidos()
  }, [fetchPedidos])

  const mostrarToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generarId()
    dispatch({ type: 'ADD_TOAST', payload: { ...toast, id } })
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id })
    }, toast.duracion || 3000)
  }, [])

  const ocultarToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id })
  }, [])

  const value: PosContextValue = {
    state,
    actualizarMesa,
    unirMesas,
    separarMesas,
    crearPedido,
    crearPedidoAsync,
    actualizarPedido,
    actualizarPedidoAsync,
    finalizarPedido,
    pagarPedido,
    eliminarPedido,
    eliminarPedidoAsync,
    actualizarProducto,
    agregarProducto,
    eliminarProducto,
    toggleDarkMode,
    refrescarModo,
    refrescarPedidos,
    mostrarToast,
    ocultarToast,
  }

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>
}

export function usePosContext(): PosContextValue {
  const ctx = useContext(PosContext)
  if (!ctx) throw new Error('usePosContext must be used within PosProvider')
  return ctx
}
