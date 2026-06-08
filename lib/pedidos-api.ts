/**
 * Pedidos API Service
 * Handles all CRUD operations for pedidos (orders) against the real backend.
 * Maps the frontend POS data model to the backend's expected format.
 */

import { apiRequest } from './api'

// ─── Backend Enums ───────────────────────────────────────
export type OrderType = 'MESA' | 'PARA_LLEVAR'
export type CustomerType = 'REGULAR' | 'PENSIONER'
export type OrderStatus = 'ACTIVE' | 'CONFIRMED'
export type PaymentMethod = 'EFECTIVO' | 'YAPE'

// ─── Backend DTOs ────────────────────────────────────────
export interface CreatePedidoDTO {
  type: OrderType
  tableNumber?: string
  customerType: CustomerType
  notes?: string
  items: {
    productoId: number
    quantity: number
    isTakeaway: boolean
  }[]
}

export interface UpdatePedidoDTO {
  type?: OrderType
  tableNumber?: string
  customerType?: CustomerType
  notes?: string
  items?: {
    productoId: number
    quantity: number
    isTakeaway: boolean
  }[]
}

export interface PaymentDTO {
  payments: {
    method: PaymentMethod
    amount: number
  }[]
}

// ─── Backend Response Types ──────────────────────────────
export interface BackendPedido {
  id: string
  type: OrderType
  tableNumber: string | null
  customerType: CustomerType
  status: OrderStatus
  notes: string | null
  total: string | number
  createdAt: string
  updatedAt: string
  items?: BackendPedidoItem[]
}

export interface BackendPedidoItem {
  id: string
  pedidoId: string
  productoId: number
  quantity: number
  isTakeaway: boolean
  unitPrice: string | number
  subtotal: string | number
  producto?: {
    id: number
    nombre: string
    descripcion: string | null
    precio: string
    imagen: string | null
    categoria: string
  }
}

export interface BackendVenta {
  id: string
  pedidoId: string
  total: string | number
  createdAt: string
  payments: {
    id: string
    method: PaymentMethod
    amount: string | number
  }[]
}

// ─── API Functions ───────────────────────────────────────

/**
 * Create a new pedido (order).
 * Merging tables: tableNumber will be "4-5" for merged Mesa 4 + Mesa 5.
 */
export async function crearPedidoAPI(data: CreatePedidoDTO): Promise<BackendPedido> {
  return apiRequest<BackendPedido>('/pedidos', {
    method: 'POST',
    body: data,
  })
}

/**
 * List all active/confirmed pedidos.
 */
export async function listarPedidosAPI(): Promise<BackendPedido[]> {
  return apiRequest<BackendPedido[]>('/pedidos')
}

/**
 * Get a single pedido by ID (with items and products).
 */
export async function obtenerPedidoAPI(id: string): Promise<BackendPedido> {
  return apiRequest<BackendPedido>(`/pedidos/${id}`)
}

/**
 * Update a pedido (header and/or items).
 * If items are sent, replaces the full list and recalculates total.
 */
export async function actualizarPedidoAPI(id: string, data: UpdatePedidoDTO): Promise<BackendPedido> {
  return apiRequest<BackendPedido>(`/pedidos/${id}`, {
    method: 'PATCH',
    body: data,
  })
}

/**
 * Delete a pedido (temporal order).
 */
export async function eliminarPedidoAPI(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/pedidos/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Confirm a pedido (mark as CONFIRMED).
 */
export async function confirmarPedidoAPI(id: string): Promise<BackendPedido> {
  return apiRequest<BackendPedido>(`/pedidos/${id}/confirmar`, {
    method: 'PATCH',
  })
}

/**
 * Pay a pedido - registers payment(s) and converts the pedido into a venta (sale).
 * Supports single or mixed payments.
 */
export async function pagarPedidoAPI(id: string, data: PaymentDTO): Promise<BackendVenta> {
  return apiRequest<BackendVenta>(`/pedidos/${id}/pagar`, {
    method: 'POST',
    body: data,
  })
}

/**
 * List all finalized ventas (sales).
 */
export async function listarVentasAPI(): Promise<BackendVenta[]> {
  return apiRequest<BackendVenta[]>('/ventas')
}

/**
 * Get a single venta by ID (with items, products, and payments).
 */
export async function obtenerVentaAPI(id: string): Promise<BackendVenta> {
  return apiRequest<BackendVenta>(`/ventas/${id}`)
}

// ─── Utility: Map frontend mesa data to backend tableNumber ───

/**
 * Builds the tableNumber string for the backend.
 * For merged tables: "4-5" (mesa 4 joined with mesa 5).
 * For single tables: "4".
 * For para_llevar: null (the type field handles it).
 */
export function buildTableNumber(mesaId: string, mesasUnidas: string[]): string | undefined {
  if (mesaId === 'para_llevar') return undefined

  const mainNum = mesaId.replace('mesa-', '')
  if (mesasUnidas.length === 0) return mainNum

  const mergedNums = mesasUnidas.map((id) => id.replace('mesa-', ''))
  return [mainNum, ...mergedNums].join('-')
}

/**
 * Maps frontend TipoCliente to backend CustomerType.
 */
export function mapCustomerType(tipo: string): CustomerType {
  if (tipo === 'regular') return 'REGULAR'
  return 'PENSIONER' // pensionista_qr or pensionista_codigo
}

/**
 * Maps frontend mesa info to backend OrderType.
 */
export function mapOrderType(mesaId: string): OrderType {
  return mesaId === 'para_llevar' ? 'PARA_LLEVAR' : 'MESA'
}
