'use client'

import { useState, useCallback } from 'react'
import { Sun, Moon, Coffee, UtensilsCrossed, Moon as MoonIcon } from 'lucide-react'
import type { TipoCliente, Pensionista } from './lib/types'
import { labelModo, iconoModo } from './lib/utils'
import { PosProvider, usePosContext } from './context/PosContext'
import NavTabs from './components/layout/NavTabs'
import ToastContainer from './components/layout/ToastContainer'
import CroquisMesas from './components/croquis/CroquisMesas'
import ListaPedidos from './components/pedidos/ListaPedidos'
import MenuEditor from './components/menu/MenuEditor'
import FlujoPensionista from './components/pensionista/FlujoPensionista'
import EscanerQR from './components/pensionista/EscanerQR'
import IngresoCodigosMultiples from './components/pensionista/IngresoCodigosMultiples'
import PantallaPedido from './components/pedido/PantallaPedido'

type Pantalla =
  | { tipo: 'croquis' }
  | { tipo: 'pedidos' }
  | { tipo: 'menu' }
  | { tipo: 'flujo-pensionista'; mesaId: string }
  | { tipo: 'escaner-qr'; mesaId: string }
  | { tipo: 'ingreso-codigos'; mesaId: string }
  | { tipo: 'pedido'; mesaId: string; tipoCliente: TipoCliente; pensionista?: Pensionista }

function ModoIcon({ modo }: { modo: string }) {
  if (modo === 'desayuno') return <Coffee size={12} />
  if (modo === 'almuerzo') return <UtensilsCrossed size={12} />
  return <MoonIcon size={12} />
}

function RecepcionContent() {
  const { state, toggleDarkMode } = usePosContext()
  const [pantalla, setPantalla] = useState<Pantalla>({ tipo: 'croquis' })
  const [tabActiva, setTabActiva] = useState('croquis')

  const handleTabCambiar = useCallback((tab: string) => {
    setTabActiva(tab)
    if (tab === 'croquis') setPantalla({ tipo: 'croquis' })
    else if (tab === 'pedidos') setPantalla({ tipo: 'pedidos' })
    else if (tab === 'menu') setPantalla({ tipo: 'menu' })
  }, [])

  const volverACroquis = useCallback(() => {
    setPantalla({ tipo: 'croquis' })
    setTabActiva('croquis')
  }, [])

  const volverAPedidos = useCallback(() => {
    setPantalla({ tipo: 'pedidos' })
    setTabActiva('pedidos')
  }, [])

  const handleIrAPedido = useCallback((mesaId: string, tipo: TipoCliente) => {
    if (tipo === 'regular') {
      setPantalla({ tipo: 'pedido', mesaId, tipoCliente: 'regular' })
    } else {
      setPantalla({ tipo: 'flujo-pensionista', mesaId })
    }
  }, [])

  const showNav =
    pantalla.tipo === 'croquis' ||
    pantalla.tipo === 'pedidos' ||
    pantalla.tipo === 'menu'

  const mesaNumero = (mesaId: string): string => {
    const m = state.mesas.find((mesa) => mesa.id === mesaId)
    return m?.numero ?? mesaId
  }

  // Active orders count for header badge
  const pedidosActivos = state.pedidos.filter((p) => p.estado === 'activo').length

  return (
    <div
      className="h-dvh flex flex-col"
      style={{ backgroundColor: 'var(--pos-bg)', color: 'var(--pos-text)' }}
    >
      {/* ── Main Header (visible on tab screens only) ── */}
      {showNav && (
        <header
          className="pos-header sticky top-0 z-30 px-4 sm:px-6"
          style={{ height: 60 }}
        >
          <div className="h-full flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--pos-primary)', boxShadow: 'var(--pos-shadow-cyan)' }}
              >
                <UtensilsCrossed size={15} color="#fff" />
              </div>
              <div className="leading-none">
                <h1
                  className="font-heading text-[15px] font-bold leading-none tracking-tight"
                  style={{ color: 'var(--pos-text)' }}
                >
                  Pension<span style={{ color: 'var(--pos-primary)' }}>POS</span>
                </h1>
                <p
                  className="text-[10px] leading-tight mt-0.5"
                  style={{ color: 'var(--pos-text-muted)', fontFamily: 'Outfit, sans-serif' }}
                >
                  Recepción
                </p>
              </div>
            </div>

            {/* Right: Modo + orders count + dark mode toggle */}
            <div className="flex items-center gap-2">

              {/* Active orders badge (mobile-friendly) */}
              {pedidosActivos > 0 && (
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
                  style={{
                    backgroundColor: 'var(--pos-danger-bg)',
                    color: 'var(--pos-danger)',
                    border: '1px solid var(--pos-danger-border)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--pos-danger)' }}
                  />
                  {pedidosActivos} activo{pedidosActivos !== 1 ? 's' : ''}
                </div>
              )}

              {/* Modo badge */}
              <span className={`badge-modo badge-${state.modoActual} hidden sm:inline-flex`}>
                <ModoIcon modo={state.modoActual} />
                {labelModo(state.modoActual)}
              </span>

              {/* Theme toggle — animated */}
              <button
                onClick={toggleDarkMode}
                className="pos-btn w-9 h-9 rounded-xl"
                style={{
                  border: '1px solid var(--pos-border)',
                  color: 'var(--pos-text-muted)',
                  backgroundColor: 'var(--pos-surface-2)',
                }}
                aria-label={state.darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <span
                  style={{
                    display: 'flex',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
                    transform: state.darkMode ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.8)',
                    opacity: state.darkMode ? 1 : 0,
                    position: 'absolute',
                  }}
                >
                  <Sun size={16} />
                </span>
                <span
                  style={{
                    display: 'flex',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
                    transform: state.darkMode ? 'rotate(90deg) scale(0.8)' : 'rotate(0deg) scale(1)',
                    opacity: state.darkMode ? 0 : 1,
                    position: 'absolute',
                  }}
                >
                  <Moon size={16} />
                </span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ── Desktop nav tabs ── */}
      {showNav && <NavTabs tabActiva={tabActiva} onCambiar={handleTabCambiar} />}

      {/* ── Main content area ── */}
      <main
        className="flex-1 overflow-y-auto pos-scrollbar"
        style={{ paddingBottom: showNav ? '4rem' : 0 }}
      >
        {/* Croquis view */}
        {pantalla.tipo === 'croquis' && (
          <div className="animate-fade-in">
            <CroquisMesas
              onIrAPedido={handleIrAPedido}
              onIrAPedidos={volverAPedidos}
            />
          </div>
        )}

        {/* Orders list */}
        {pantalla.tipo === 'pedidos' && (
          <div className="animate-fade-in">
            <ListaPedidos />
          </div>
        )}

        {/* Menu editor */}
        {pantalla.tipo === 'menu' && (
          <div className="animate-fade-in">
            <MenuEditor />
          </div>
        )}

        {/* Pensionista flow selector */}
        {pantalla.tipo === 'flujo-pensionista' && (
          <div className="animate-slide-up h-full">
            <FlujoPensionista
              mesaNumero={mesaNumero(pantalla.mesaId)}
              onQR={() => setPantalla({ tipo: 'escaner-qr', mesaId: pantalla.mesaId })}
              onCodigos={() => setPantalla({ tipo: 'ingreso-codigos', mesaId: pantalla.mesaId })}
              onVolver={volverACroquis}
            />
          </div>
        )}

        {/* QR Scanner */}
        {pantalla.tipo === 'escaner-qr' && (
          <div className="animate-slide-up h-full">
            <EscanerQR
              modo={state.modoActual}
              onEscaneado={(p) =>
                setPantalla({
                  tipo: 'pedido',
                  mesaId: pantalla.mesaId,
                  tipoCliente: 'pensionista_qr',
                  pensionista: p,
                })
              }
              onVolver={() => setPantalla({ tipo: 'flujo-pensionista', mesaId: pantalla.mesaId })}
            />
          </div>
        )}

        {/* Multi-code pensionista entry */}
        {pantalla.tipo === 'ingreso-codigos' && (
          <div className="animate-slide-up h-full">
            <IngresoCodigosMultiples
              mesaId={pantalla.mesaId}
              onTodosConfirmados={volverACroquis}
              onVolver={() => setPantalla({ tipo: 'flujo-pensionista', mesaId: pantalla.mesaId })}
            />
          </div>
        )}

        {/* Order creation screen */}
        {pantalla.tipo === 'pedido' && (
          <div className="animate-slide-up h-full">
            <PantallaPedido
              mesaId={pantalla.mesaId}
              tipoCliente={pantalla.tipoCliente}
              pensionista={pantalla.pensionista}
              onVolver={volverACroquis}
              onPedidoConfirmado={volverACroquis}
            />
          </div>
        )}
      </main>

      {/* ── Toast notifications ── */}
      <ToastContainer />
    </div>
  )
}

export default function RecepcionPage() {
  return (
    <PosProvider>
      <RecepcionContent />
    </PosProvider>
  )
}