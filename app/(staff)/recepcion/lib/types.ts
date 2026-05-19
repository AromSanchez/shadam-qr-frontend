export type EstadoMesa = 'libre' | 'ocupado'
export type ModoPension = 'desayuno' | 'almuerzo' | 'cena'
export type TipoPensionista = 'escolar' | 'externo'
export type MetodoPago = 'efectivo' | 'yape'
export type TipoCliente = 'regular' | 'pensionista_qr' | 'pensionista_codigo'
export type CategoriaProducto =
  | 'bebida' | 'acompañamiento' | 'caldo'
  | 'refresco' | 'entrada' | 'segundo'
  | 'sopa' | 'infusion' | 'plato_ligero' | 'otro'

export interface Mesa {
  id: string
  numero: string
  estado: EstadoMesa
  unidaCon: string[]
  pedidoActualId?: string
  posX: number
  posY: number
  ancho: number
  alto: number
}

export interface Producto {
  id: string
  nombre: string
  precioPension: number
  precioRegular: number
  categoria: CategoriaProducto
  modo: ModoPension[]
  activo: boolean
  esFavorito: boolean
}

export interface ItemPedido {
  id: string
  producto: Producto
  cantidad: number
  paraLlevar: boolean
  notas?: string
}

export interface Extra {
  id: string
  descripcion: string
  monto: number
}

export interface Pedido {
  id: string
  numeroPedido: number
  mesaId: string
  mesasUnidas: string[]
  items: ItemPedido[]
  extras: Extra[]
  total: number
  modo: ModoPension
  tipo: TipoCliente
  pensionistas?: Pensionista[]
  creadoEn: Date
  estado: 'activo' | 'finalizado'
}

export interface Pensionista {
  id: string
  codigo: string
  nombre: string
  tipo: TipoPensionista
  saldo: number
  pedidoConfirmado: boolean
  itemsPedido: ItemPedido[]
  extras: Extra[]
}

export interface Toast {
  id: string
  mensaje: string
  tipo: 'success' | 'error' | 'warning' | 'info'
  duracion?: number
}
