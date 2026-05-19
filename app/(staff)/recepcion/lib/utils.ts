import type { ModoPension, CategoriaProducto } from './types'

/** Detects current meal mode based on system clock */
export function detectarModo(): ModoPension {
  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()
  if (mins >= 420 && mins < 660) return 'desayuno'   // 07:00–11:00
  if (mins >= 720 && mins < 1050) return 'almuerzo'   // 12:00–17:30
  if (mins >= 1080 && mins < 1320) return 'cena'      // 18:00–22:00
  // fuera de horario → modo más cercano
  if (mins < 420) return 'cena'        // madrugada → cena (pasada)
  if (mins < 720) return 'desayuno'    // 11:00-12:00 → desayuno aún cercano
  return 'cena'                        // 22:00+ → cena
}

/** Calculates change for cash payments */
export function calcularVuelto(total: number, recibido: number): number {
  return Math.max(0, recibido - total)
}

/** Validates if a pensionista has enough balance */
export function validarSaldo(saldo: number, total: number): boolean {
  return saldo >= total
}

/** Generates a simple unique ID */
export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7)
}

/** Formats a price in Peruvian soles */
export function formatearPrecio(monto: number): string {
  return `S/ ${monto.toFixed(2)}`
}

/** Generates an incremental order number, resets daily */
export function generarNumeroPedido(): number {
  if (typeof window === 'undefined') return 1
  const hoy = new Date().toISOString().slice(0, 10)
  const fechaGuardada = localStorage.getItem('pos_pedido_date')
  let counter = parseInt(localStorage.getItem('pos_pedido_counter') || '0', 10)
  if (fechaGuardada !== hoy) {
    counter = 0
    localStorage.setItem('pos_pedido_date', hoy)
  }
  counter++
  localStorage.setItem('pos_pedido_counter', counter.toString())
  return counter
}

/** Returns a human-readable label for the meal mode */
export function labelModo(modo: ModoPension): string {
  const labels: Record<ModoPension, string> = {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    cena: 'Cena',
  }
  return labels[modo]
}

/** Returns the emoji icon for a meal mode */
export function iconoModo(modo: ModoPension): string {
  const iconos: Record<ModoPension, string> = {
    desayuno: '🌅',
    almuerzo: '☀️',
    cena: '🌙',
  }
  return iconos[modo]
}

/**
 * Checks if a category belongs to an exclusive breakfast group.
 * In breakfast, 'caldo' is mutually exclusive with 'bebida'+'acompañamiento'.
 */
export function esGrupoExclusivo(cat: CategoriaProducto): 'caldo' | 'normal' | null {
  if (cat === 'caldo') return 'caldo'
  if (cat === 'bebida' || cat === 'acompañamiento') return 'normal'
  return null
}

/** Gets category display label */
export function labelCategoria(cat: CategoriaProducto): string {
  const labels: Record<CategoriaProducto, string> = {
    bebida: 'Bebidas',
    'acompañamiento': 'Acompañamientos',
    caldo: 'Caldos',
    refresco: 'Refrescos',
    entrada: 'Entradas',
    segundo: 'Segundos',
    sopa: 'Sopas',
    infusion: 'Infusiones',
    plato_ligero: 'Platos ligeros',
    otro: 'Otros',
  }
  return labels[cat]
}
