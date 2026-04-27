'use client'

import { useState, useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'
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

  const handleIrAPedido = useCallback((mesaId: string, tipo: TipoCliente) => {
    if (tipo === 'regular') {
      setPantalla({ tipo: 'pedido', mesaId, tipoCliente: 'regular' })
    } else {
      // Show pensionista selection
      setPantalla({ tipo: 'flujo-pensionista', mesaId })
    }
  }, [])


  // Hide nav for inner screens

  const showNav = pantalla.tipo === 'croquis' || pantalla.tipo === 'pedidos' || pantalla.tipo === 'menu'

  const mesaNumero = (mesaId: string): string => {
    const m = state.mesas.find((mesa) => mesa.id === mesaId)
    return m?.numero ?? mesaId
  }

  return (
    <div className="h-dvh flex flex-col transition-colors duration-200" style={{ backgroundColor: 'var(--pos-bg)' }}>
      {/* Header */}
      {showNav && (
        <header className="pos-header sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold" style={{ color: 'var(--pos-text)' }}>
              Pension<span style={{ color: 'var(--pos-primary)' }}>POS</span>
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--pos-text-muted)' }}>Panel de Recepción</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge-modo badge-${state.modoActual}`}>
              {iconoModo(state.modoActual)} {labelModo(state.modoActual)}
            </span>
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
              style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text-muted)', backgroundColor: 'var(--pos-card)' }}
            >
              {state.darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>
      )}


      {/* Desktop nav tabs */}
      {showNav && <NavTabs tabActiva={tabActiva} onCambiar={handleTabCambiar} />}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {pantalla.tipo === 'croquis' && (
          <CroquisMesas onIrAPedido={handleIrAPedido} />
        )}

        {pantalla.tipo === 'pedidos' && <ListaPedidos />}

        {pantalla.tipo === 'menu' && <MenuEditor />}

        {pantalla.tipo === 'flujo-pensionista' && (
          <FlujoPensionista
            mesaNumero={mesaNumero(pantalla.mesaId)}
            onQR={() => setPantalla({ tipo: 'escaner-qr', mesaId: pantalla.mesaId })}
            onCodigos={() => setPantalla({ tipo: 'ingreso-codigos', mesaId: pantalla.mesaId })}
            onVolver={volverACroquis}
          />
        )}

        {pantalla.tipo === 'escaner-qr' && (
          <EscanerQR
            modo={state.modoActual}
            onEscaneado={(p) => setPantalla({ tipo: 'pedido', mesaId: pantalla.mesaId, tipoCliente: 'pensionista_qr', pensionista: p })}
            onVolver={() => setPantalla({ tipo: 'flujo-pensionista', mesaId: pantalla.mesaId })}
          />
        )}

        {pantalla.tipo === 'ingreso-codigos' && (
          <IngresoCodigosMultiples
            mesaId={pantalla.mesaId}
            onTodosConfirmados={volverACroquis}
            onVolver={() => setPantalla({ tipo: 'flujo-pensionista', mesaId: pantalla.mesaId })}
          />
        )}

        {pantalla.tipo === 'pedido' && (
          <PantallaPedido
            mesaId={pantalla.mesaId}
            tipoCliente={pantalla.tipoCliente}
            pensionista={pantalla.pensionista}
            onVolver={volverACroquis}
            onPedidoConfirmado={volverACroquis}
          />
        )}
      </main>


      {/* Toasts */}
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