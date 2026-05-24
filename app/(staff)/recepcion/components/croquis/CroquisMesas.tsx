'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, Users, LayoutGrid } from 'lucide-react'
import type { Mesa, TipoCliente } from '../../lib/types'
import { usePosContext } from '../../context/PosContext'
import MesaCard from './MesaCard'
import ParaLlevarZone from './ParaLlevarZone'
import ModalAccionMesa from './ModalAccionMesa'
import ModalUnirMesas from './ModalUnirMesas'

interface CroquisMesasProps {
  onIrAPedido: (mesaId: string, tipo: TipoCliente) => void
  onIrAPedidos: () => void
}


export default function CroquisMesas({ onIrAPedido, onIrAPedidos }: CroquisMesasProps) {
  const { state, unirMesas, separarMesas, mostrarToast } = usePosContext()
  const { mesas, pedidos } = state

  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [unirModalOpen, setUnirModalOpen] = useState(false)

  const paraLlevar = mesas.find((m) => m.id === 'para_llevar')!
  const mesasRegulares = mesas.filter((m) => m.id !== 'para_llevar')

  // Count active Para Llevar orders
  const pedidosParaLlevar = pedidos.filter((p) => p.mesaId === 'para_llevar' && p.estado === 'activo').length

  // Stats
  const mesasLibres = mesasRegulares.filter((m) => m.estado === 'libre').length
  const mesasOcupadas = mesasRegulares.filter((m) => m.estado === 'ocupado').length
  const totalMesas = mesasRegulares.length

  // ── Merge-aware render list ──
  const { mesasSecundariasSet } = useMemo(() => {
    const secondaryIds = new Set<string>()
    mesasRegulares.forEach((mesa) => {
      if (mesa.unidaCon && mesa.unidaCon.length > 0) {
        mesa.unidaCon.forEach((id) => secondaryIds.add(id))
      }
    })
    return {
      mesasSecundariasSet: secondaryIds,
    }
  }, [mesasRegulares])

  // Map each secondary table to its principal table
  const secondaryToPrincipalMap = useMemo(() => {
    const map = new Map<string, Mesa>()
    mesasRegulares.forEach((principal) => {
      if (principal.unidaCon && principal.unidaCon.length > 0) {
        principal.unidaCon.forEach((secId) => {
          map.set(secId, principal)
        })
      }
    })
    return map
  }, [mesasRegulares])

  // Calculate visual connection bridges between adjacent merged tables
  const unionBridges = useMemo(() => {
    const bridges: Array<{
      id: string
      posX: number
      posY: number
      ancho: number
      alto: number
      esVertical: boolean
      estado: 'ocupado' | 'libre'
    }> = []

    const mesasMap = new Map(mesas.map((m) => [m.id, m]))
    const principalMesas = mesasRegulares.filter((m) => m.unidaCon && m.unidaCon.length > 0)

    principalMesas.forEach((principal) => {
      const grupo = [
        principal,
        ...principal.unidaCon.map((id) => mesasMap.get(id)).filter(Boolean) as Mesa[]
      ]
      const estadoGrupo = principal.estado

      for (let i = 0; i < grupo.length; i++) {
        for (let j = i + 1; j < grupo.length; j++) {
          const m1 = grupo[i]
          const m2 = grupo[j]

          const dx = Math.abs(m1.posX - m2.posX)
          const dy = Math.abs(m1.posY - m2.posY)

          const esVertical = dx < 5 && dy <= 20.1
          const esHorizontal = dy < 5 && dx <= 52.1

          if (esVertical) {
            const topMesa = m1.posY < m2.posY ? m1 : m2
            const bottomMesa = m1.posY < m2.posY ? m2 : m1

            // Connect top-bottom with a 1% height overlap on each side to avoid gaps
            const bridgeTop = topMesa.posY + topMesa.alto - 1
            const bridgeHeight = bottomMesa.posY - (topMesa.posY + topMesa.alto) + 2

            bridges.push({
              id: `bridge-${topMesa.id}-${bottomMesa.id}`,
              posX: topMesa.posX,
              posY: bridgeTop,
              ancho: topMesa.ancho,
              alto: bridgeHeight,
              esVertical: true,
              estado: estadoGrupo
            })
          } else if (esHorizontal) {
            const leftMesa = m1.posX < m2.posX ? m1 : m2
            const rightMesa = m1.posX < m2.posX ? m2 : m1

            // Connect left-right with a 1% width overlap on each side to avoid gaps
            const bridgeLeft = leftMesa.posX + leftMesa.ancho - 1
            const bridgeWidth = rightMesa.posX - (leftMesa.posX + leftMesa.ancho) + 2

            bridges.push({
              id: `bridge-${leftMesa.id}-${rightMesa.id}`,
              posX: bridgeLeft,
              posY: leftMesa.posY,
              ancho: bridgeWidth,
              alto: leftMesa.alto,
              esVertical: false,
              estado: estadoGrupo
            })
          }
        }
      }
    })

    return bridges
  }, [mesas, mesasRegulares])

  // BUG FIX: Open modal for ALL table states (occupied included)
  const handleMesaTap = (mesa: Mesa) => {
    setMesaSeleccionada(mesa)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setMesaSeleccionada(null)
  }

  const handleUnir = () => {
    setModalOpen(false)
    setUnirModalOpen(true)
  }

  const handleSeparar = () => {
    if (!mesaSeleccionada) return
    separarMesas(mesaSeleccionada.id)
    mostrarToast({ mensaje: `✂️ Mesas separadas correctamente`, tipo: 'success' })
    handleCloseModal()
  }

  const handleConfirmarUnion = (ids: string[]) => {
    if (!mesaSeleccionada) return
    unirMesas(mesaSeleccionada.id, ids)
    mostrarToast({ mensaje: `🔗 Mesas unidas correctamente`, tipo: 'success' })
    setUnirModalOpen(false)
    setMesaSeleccionada(null)
  }

  // Available mesas for merging: libre, not para_llevar, not already a secondary, not the selected one
  // AND must be adjacent (step-by-step neighbor) to the selected mesa or any mesa already joined with it
  const mesasDisponiblesParaUnir = useMemo(() => {
    if (!mesaSeleccionada) return []

    const grupoPrincipal = [
      mesaSeleccionada,
      ...mesaSeleccionada.unidaCon.map((id) => mesas.find((m) => m.id === id)).filter(Boolean) as Mesa[]
    ]

    return mesasRegulares.filter((m) => {
      const esEligibleBasico =
        m.id !== mesaSeleccionada.id &&
        m.id !== 'para_llevar' &&
        !mesaSeleccionada.unidaCon.includes(m.id) &&
        !mesasSecundariasSet.has(m.id) &&
        m.unidaCon.length === 0

      if (!esEligibleBasico) return false

      // Check if m is adjacent to any mesa in the current group
      return grupoPrincipal.some((mesaGrupo) => {
        const dx = Math.abs(m.posX - mesaGrupo.posX)
        const dy = Math.abs(m.posY - mesaGrupo.posY)

        // Vertical neighbor: same column (dx < 5), adjacent row (dy <= 20.1)
        const esVecinoVertical = dx < 5 && dy <= 20.1

        // Horizontal neighbor: same row (dy < 5), adjacent column (dx <= 52.1)
        const esVecinoHorizontal = dy < 5 && dx <= 52.1

        return esVecinoVertical || esVecinoHorizontal
      })
    })
  }, [mesaSeleccionada, mesas, mesasRegulares, mesasSecundariasSet])

  return (
    <div className="animate-fade-in p-4 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="font-heading text-lg font-bold leading-tight" style={{ color: 'var(--pos-text)' }}>
          Croquis del restaurante
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--pos-text-muted)' }}>
          Toca una mesa para iniciar o gestionar un pedido
        </p>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-stretch gap-3 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--pos-card)',
          border: '1px solid var(--pos-border)',
          padding: '12px 16px',
          boxShadow: 'var(--pos-shadow-sm)',
        }}
      >
        {/* Libres */}
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--pos-table-free)' }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--pos-text-muted)' }}>
              Libres
            </span>
          </div>
          <span
            className="text-xl font-heading font-bold text-tabular leading-tight"
            style={{ color: 'var(--pos-table-free)' }}
          >
            {mesasLibres}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch" style={{ backgroundColor: 'var(--pos-divider)' }} />

        {/* Ocupadas */}
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--pos-table-occupied)' }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--pos-text-muted)' }}>
              Ocupadas
            </span>
          </div>
          <span
            className="text-xl font-heading font-bold text-tabular leading-tight"
            style={{ color: 'var(--pos-table-occupied)' }}
          >
            {mesasOcupadas}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch" style={{ backgroundColor: 'var(--pos-divider)' }} />

        {/* Total */}
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <LayoutGrid size={11} style={{ color: 'var(--pos-text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--pos-text-muted)' }}>
              Total
            </span>
          </div>
          <span
            className="text-xl font-heading font-bold text-tabular leading-tight"
            style={{ color: 'var(--pos-text)' }}
          >
            {totalMesas}
          </span>
        </div>
      </div>

      {/* L-shaped croquis container */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          paddingBottom: '90%',
          backgroundColor: 'var(--pos-card)',
          border: '2px solid var(--pos-border)',
          boxShadow: 'var(--pos-shadow-md)',
          borderRadius: 'var(--pos-radius-2xl)',
        }}
      >
        {/* L-shape cutout: top-right corner */}
        <div
          className="absolute z-10"
          style={{
            top: 0,
            right: 0,
            width: '42%',
            height: '32%',
            backgroundColor: 'var(--pos-bg)',
            borderBottom: '2px solid var(--pos-border)',
            borderLeft: '2px solid var(--pos-border)',
            borderBottomLeftRadius: 'var(--pos-radius-xl)',
          }}
        />

        {/* Para llevar */}
        <ParaLlevarZone
          cantidadPedidos={pedidosParaLlevar}
          onTap={() => handleMesaTap(paraLlevar)}
          posX={paraLlevar.posX}
          posY={paraLlevar.posY}
          ancho={paraLlevar.ancho}
          alto={paraLlevar.alto}
        />

        {/* Render visual bridges first (behind the table cards) */}
        {unionBridges.map((bridge) => {
          const isOccupied = bridge.estado === 'ocupado'
          const borderStyle = isOccupied ? 'solid' : 'dashed'
          const borderColor = isOccupied 
            ? 'var(--pos-table-occupied-border)' 
            : 'rgba(6, 182, 212, 0.50)'
          const bg = isOccupied 
            ? 'var(--pos-table-occupied-bg)' 
            : 'var(--pos-primary-dim)'
            
          const borderStyles: React.CSSProperties = bridge.esVertical
            ? {
                borderLeftWidth: '1.5px',
                borderRightWidth: '1.5px',
                borderLeftStyle: borderStyle,
                borderRightStyle: borderStyle,
                borderLeftColor: borderColor,
                borderRightColor: borderColor,
              }
            : {
                borderTopWidth: '1.5px',
                borderBottomWidth: '1.5px',
                borderTopStyle: borderStyle,
                borderBottomStyle: borderStyle,
                borderTopColor: borderColor,
                borderBottomColor: borderColor,
              }

          return (
            <div
              key={bridge.id}
              className="absolute pointer-events-none transition-all duration-250"
              style={{
                left: `${bridge.posX}%`,
                top: `${bridge.posY}%`,
                width: `${bridge.ancho}%`,
                height: `${bridge.alto}%`,
                backgroundColor: bg,
                zIndex: 5,
                transitionTimingFunction: 'var(--pos-ease-spring)',
                ...borderStyles,
              }}
            />
          )
        })}

        {/* Mesas — render all regular tables individually */}
        {mesasRegulares.map((mesa) => {
          const principalAsociada = secondaryToPrincipalMap.get(mesa.id)
          const esSecundaria = !!principalAsociada
          const mesaObjetivo = principalAsociada || mesa

          const mesasUnidas = !esSecundaria && mesa.unidaCon.length > 0
            ? mesa.unidaCon
                .map((id) => mesas.find((m) => m.id === id))
                .filter(Boolean) as Mesa[]
            : undefined

          return (
            <MesaCard
              key={mesa.id}
              mesa={mesa}
              mesasUnidas={mesasUnidas}
              posX={mesa.posX}
              posY={mesa.posY}
              ancho={mesa.ancho}
              alto={mesa.alto}
              onTap={() => handleMesaTap(mesaObjetivo)}
              esGrupoUnido={esSecundaria || mesa.unidaCon.length > 0}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-5 py-2.5 px-4 rounded-xl"
        style={{
          backgroundColor: 'var(--pos-surface)',
          border: '1px solid var(--pos-border)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--pos-table-free-bg)', border: '1.5px solid var(--pos-table-free-border)' }}
          />
          <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Libre</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--pos-table-occupied-bg)', border: '1.5px solid var(--pos-table-occupied-border)' }}
          />
          <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Ocupada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', border: '1.5px solid rgba(6, 182, 212, 0.4)' }}
          />
          <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Unida</span>
        </div>
      </div>

      {/* Modal de acción — BUG FIX: opens for ALL states including ocupado */}
      {mesaSeleccionada && (
        <ModalAccionMesa
          mesa={mesaSeleccionada}
          open={modalOpen}
          onClose={handleCloseModal}
          onClienteRegular={() => {
            handleCloseModal()
            onIrAPedido(mesaSeleccionada.id, 'regular')
          }}
          onPensionista={() => {
            handleCloseModal()
            onIrAPedido(mesaSeleccionada.id, 'pensionista_qr')
          }}
          onUnir={handleUnir}
          onSeparar={handleSeparar}
          hayMesasDisponibles={mesasDisponiblesParaUnir.length > 0}
          onVerPedido={() => {
            handleCloseModal()
            onIrAPedidos()
          }}
        />
      )}

      {/* Modal de unión */}
      {mesaSeleccionada && (
        <ModalUnirMesas
          mesaPrincipal={mesaSeleccionada}
          mesasDisponibles={mesasDisponiblesParaUnir}
          open={unirModalOpen}
          onClose={() => { setUnirModalOpen(false); setMesaSeleccionada(null) }}
          onConfirmar={handleConfirmarUnion}
        />
      )}
    </div>
  )
}
