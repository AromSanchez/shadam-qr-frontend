import type { Mesa, Producto, Pensionista } from './types'

// ========== PENSIONISTAS ==========
export const pensionistasMock: Pensionista[] = [
  { id: 'pen-1', codigo: 'ESC001', nombre: 'Juan Quispe',    tipo: 'escolar', saldo: 24, pedidoConfirmado: false, itemsPedido: [], extras: [] },
  { id: 'pen-2', codigo: 'ESC002', nombre: 'María Flores',   tipo: 'escolar', saldo: 8,  pedidoConfirmado: false, itemsPedido: [], extras: [] },
  { id: 'pen-3', codigo: 'ESC003', nombre: 'Carlos Mamani',  tipo: 'escolar', saldo: 0,  pedidoConfirmado: false, itemsPedido: [], extras: [] },
  { id: 'pen-4', codigo: 'EXT001', nombre: 'Ana Torres',     tipo: 'externo', saldo: 32, pedidoConfirmado: false, itemsPedido: [], extras: [] },
  { id: 'pen-5', codigo: 'EXT002', nombre: 'Luis Huanca',    tipo: 'externo', saldo: 16, pedidoConfirmado: false, itemsPedido: [], extras: [] },
  { id: 'pen-6', codigo: 'EXT003', nombre: 'Rosa Condori',   tipo: 'externo', saldo: 8,  pedidoConfirmado: false, itemsPedido: [], extras: [] },
  { id: 'pen-7', codigo: 'EXT004', nombre: 'Pedro Ríos',     tipo: 'externo', saldo: 0,  pedidoConfirmado: false, itemsPedido: [], extras: [] },
  { id: 'pen-8', codigo: 'ESC004', nombre: 'Sofía Vargas',   tipo: 'escolar', saldo: 12, pedidoConfirmado: false, itemsPedido: [], extras: [] },
]

// ========== MESAS ==========
export const mesasIniciales: Mesa[] = [
  { id: 'para_llevar', numero: 'Para llevar', estado: 'libre', unidaCon: [], posX: 3,  posY: 2,  ancho: 35, alto: 11 },
  { id: 'mesa-1',      numero: '1',           estado: 'libre', unidaCon: [], posX: 3,  posY: 15, ancho: 28, alto: 17 },
  { id: 'mesa-3',      numero: '3',           estado: 'libre', unidaCon: [], posX: 3,  posY: 35, ancho: 28, alto: 17 },
  { id: 'mesa-5',      numero: '5',           estado: 'libre', unidaCon: [], posX: 3,  posY: 55, ancho: 28, alto: 17 },
  { id: 'mesa-7',      numero: '7',           estado: 'libre', unidaCon: [], posX: 3,  posY: 75, ancho: 28, alto: 17 },
  { id: 'mesa-2',      numero: '2',           estado: 'libre', unidaCon: [], posX: 55, posY: 35, ancho: 28, alto: 17 },
  { id: 'mesa-4',      numero: '4',           estado: 'libre', unidaCon: [], posX: 55, posY: 55, ancho: 28, alto: 17 },
  { id: 'mesa-6',      numero: '6',           estado: 'libre', unidaCon: [], posX: 55, posY: 75, ancho: 28, alto: 17 },
]

// ========== PRODUCTOS ==========
export const productosIniciales: Producto[] = [
  // === DESAYUNO ===
  { id: 'prod_1',  nombre: 'Café con leche',   precioPension: 4, precioRegular: 6.5,  categoria: 'bebida',          modo: ['desayuno'], activo: true, esFavorito: true },
  { id: 'prod_2',  nombre: 'Leche',            precioPension: 4, precioRegular: 6.5,  categoria: 'bebida',          modo: ['desayuno'], activo: true, esFavorito: false },
  { id: 'prod_3',  nombre: 'Avena',            precioPension: 4, precioRegular: 6.5,  categoria: 'bebida',          modo: ['desayuno'], activo: true, esFavorito: true },
  { id: 'prod_4',  nombre: 'Emoliente',        precioPension: 4, precioRegular: 6,    categoria: 'bebida',          modo: ['desayuno'], activo: true, esFavorito: false },
  { id: 'prod_5',  nombre: 'Pan con huevo',    precioPension: 4, precioRegular: 6.5,  categoria: 'acompañamiento',  modo: ['desayuno'], activo: true, esFavorito: true },
  { id: 'prod_6',  nombre: 'Pan con palta',    precioPension: 4, precioRegular: 7,    categoria: 'acompañamiento',  modo: ['desayuno'], activo: true, esFavorito: false },
  { id: 'prod_7',  nombre: 'Pan con queso',    precioPension: 4, precioRegular: 6.5,  categoria: 'acompañamiento',  modo: ['desayuno'], activo: true, esFavorito: false },
  { id: 'prod_8',  nombre: 'Tostadas',         precioPension: 4, precioRegular: 6,    categoria: 'acompañamiento',  modo: ['desayuno'], activo: true, esFavorito: false },
  { id: 'prod_9',  nombre: 'Caldo de gallina', precioPension: 4, precioRegular: 7,    categoria: 'caldo',           modo: ['desayuno'], activo: true, esFavorito: true },
  { id: 'prod_10', nombre: 'Caldo de res',     precioPension: 4, precioRegular: 7,    categoria: 'caldo',           modo: ['desayuno'], activo: true, esFavorito: false },
  { id: 'prod_11', nombre: 'Sopa de verduras', precioPension: 4, precioRegular: 6,    categoria: 'caldo',           modo: ['desayuno'], activo: true, esFavorito: false },
  // === ALMUERZO ===
  { id: 'prod_12', nombre: 'Limonada',          precioPension: 8, precioRegular: 11,  categoria: 'refresco',  modo: ['almuerzo'], activo: true, esFavorito: true },
  { id: 'prod_13', nombre: 'Chicha morada',     precioPension: 8, precioRegular: 11,  categoria: 'refresco',  modo: ['almuerzo'], activo: true, esFavorito: true },
  { id: 'prod_14', nombre: 'Refresco maracuyá', precioPension: 8, precioRegular: 11,  categoria: 'refresco',  modo: ['almuerzo'], activo: true, esFavorito: false },
  { id: 'prod_15', nombre: 'Agua mineral',      precioPension: 8, precioRegular: 10,  categoria: 'refresco',  modo: ['almuerzo'], activo: true, esFavorito: false },
  { id: 'prod_16', nombre: 'Tamal',             precioPension: 8, precioRegular: 11,  categoria: 'entrada',   modo: ['almuerzo'], activo: true, esFavorito: true },
  { id: 'prod_17', nombre: 'Wantan frito',      precioPension: 8, precioRegular: 11,  categoria: 'entrada',   modo: ['almuerzo'], activo: true, esFavorito: false },
  { id: 'prod_18', nombre: 'Ensalada fresca',   precioPension: 8, precioRegular: 10,  categoria: 'entrada',   modo: ['almuerzo'], activo: true, esFavorito: false },
  { id: 'prod_19', nombre: 'Causa limeña',      precioPension: 8, precioRegular: 11,  categoria: 'entrada',   modo: ['almuerzo'], activo: true, esFavorito: false },
  { id: 'prod_20', nombre: 'Arroz con pollo',   precioPension: 8, precioRegular: 11,  categoria: 'segundo',   modo: ['almuerzo'], activo: true, esFavorito: true },
  { id: 'prod_21', nombre: 'Lomo saltado',      precioPension: 8, precioRegular: 12,  categoria: 'segundo',   modo: ['almuerzo'], activo: true, esFavorito: true },
  { id: 'prod_22', nombre: 'Arroz chaufa',      precioPension: 8, precioRegular: 11,  categoria: 'segundo',   modo: ['almuerzo'], activo: true, esFavorito: false },
  { id: 'prod_23', nombre: 'Pollo a la brasa',  precioPension: 8, precioRegular: 12,  categoria: 'segundo',   modo: ['almuerzo'], activo: true, esFavorito: false },
  { id: 'prod_24', nombre: 'Seco de res',       precioPension: 8, precioRegular: 11,  categoria: 'segundo',   modo: ['almuerzo'], activo: true, esFavorito: false },
  // === CENA ===
  { id: 'prod_25', nombre: 'Aguadito de pollo',  precioPension: 8, precioRegular: 11,  categoria: 'sopa',          modo: ['cena'], activo: true, esFavorito: true },
  { id: 'prod_26', nombre: 'Sopa a la minuta',   precioPension: 8, precioRegular: 11,  categoria: 'sopa',          modo: ['cena'], activo: true, esFavorito: false },
  { id: 'prod_27', nombre: 'Caldo de res',       precioPension: 8, precioRegular: 10,  categoria: 'sopa',          modo: ['cena'], activo: true, esFavorito: false },
  { id: 'prod_28', nombre: 'Manzanilla',         precioPension: 8, precioRegular: 10,  categoria: 'infusion',      modo: ['cena'], activo: true, esFavorito: false },
  { id: 'prod_29', nombre: 'Menta',              precioPension: 8, precioRegular: 10,  categoria: 'infusion',      modo: ['cena'], activo: true, esFavorito: false },
  { id: 'prod_30', nombre: 'Muña',               precioPension: 8, precioRegular: 10,  categoria: 'infusion',      modo: ['cena'], activo: true, esFavorito: false },
  { id: 'prod_31', nombre: 'Arroz con leche',    precioPension: 8, precioRegular: 11,  categoria: 'plato_ligero',  modo: ['cena'], activo: true, esFavorito: true },
  { id: 'prod_32', nombre: 'Mazamorra morada',   precioPension: 8, precioRegular: 11,  categoria: 'plato_ligero',  modo: ['cena'], activo: true, esFavorito: false },
  { id: 'prod_33', nombre: 'Sándwich de pollo',  precioPension: 8, precioRegular: 12,  categoria: 'plato_ligero',  modo: ['cena'], activo: true, esFavorito: false },
]
