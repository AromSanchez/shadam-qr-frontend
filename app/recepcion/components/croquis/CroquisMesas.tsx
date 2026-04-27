'use client'

import { useState, useMemo } from 'react'
import type { Mesa, TipoCliente } from '../../lib/types'
import { usePosContext } from '../../context/PosContext'
import MesaCard from './MesaCard'
import ParaLlevarZone from './ParaLlevarZone'
import ModalAccionMesa from './ModalAccionMesa'
import ModalUnirMesas from './ModalUnirMesas'

interface CroquisMesasProps {
  onIrAPedido: (mesaId: string, tipo: TipoCliente) => void
}

/** Calculates bounding box for a mesa group (principal + secondaries) */
function calcularBoundingBox(mesa: Mesa, todasLasMesas: Mesa[]) {
  if (!mesa.unidaCon || mesa.unidaCon.length === 0) {
    return { posX: mesa.posX, posY: mesa.posY, ancho: mesa.ancho, alto: mesa.alto }
  }

  const todasEnGrupo = [
    mesa,
    ...mesa.unidaCon.map((id) => todasLasMesas.find((m) => m.id === id)).filter(Boolean) as Mesa[],
  ]

  const minX = Math.min(...todasEnGrupo.map((m) => m.posX))
  const minY = Math.min(...todasEnGrupo.map((m) => m.posY))
  const maxX = Math.max(...todasEnGrupo.map((m) => m.posX + m.ancho))
  const maxY = Math.max(...todasEnGrupo.map((m) => m.posY + m.alto))

  return {
    posX: minX,
    posY: minY,
    ancho: maxX - minX,
    alto: maxY - minY,
  }
}

export default function CroquisMesas({ onIrAPedido }: CroquisMesasProps) {
  const { state, unirMesas, separarMesas, mostrarToast } = usePosContext()
  const { mesas, pedidos } = state

  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [unirModalOpen, setUnirModalOpen] = useState(false)

  const paraLlevar = mesas.find((m) => m.id === 'para_llevar')!
  const mesasRegulares = mesas.filter((m) => m.id !== 'para_llevar')

  // Count active Para Llevar orders
  const pedidosParaLlevar = pedidos.filter((p) => p.mesaId === 'para_llevar' && p.estado === 'activo').length

  // ── Merge-aware render list ──
  // Identify secondary mesas (already covered by a principal's bounding box)
  const { mesasARenderizar, mesasSecundariasSet } = useMemo(() => {
    const secondaryIds = new Set<string>()
    mesasRegulares.forEach((mesa) => {
      if (mesa.unidaCon && mesa.unidaCon.length > 0) {
        mesa.unidaCon.forEach((id) => secondaryIds.add(id))
      }
    })
    return {
      mesasARenderizar: mesasRegulares.filter((m) => !secondaryIds.has(m.id)),
      mesasSecundariasSet: secondaryIds,
    }
  }, [mesasRegulares])

  const handleMesaTap = (mesa: Mesa) => {
    if (mesa.estado === 'ocupado' && mesa.id !== 'para_llevar') {
      mostrarToast({
        mensaje: `⚠️ Mesa ${mesa.numero} está ocupada. Ve a Pedidos para gestionarla.`,
        tipo: 'warning',
      })
      return
    }
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
  const mesasDisponiblesParaUnir = mesaSeleccionada
    ? mesasRegulares.filter((m) =>
        m.id !== mesaSeleccionada.id &&
        m.id !== 'para_llevar' &&
        !mesaSeleccionada.unidaCon.includes(m.id) &&
        !mesasSecundariasSet.has(m.id) &&
        m.unidaCon.length === 0 // Not already a principal of another group
      )
    : []

  return (
    <div className="animate-fade-in p-4 sm:p-6">
      <h2 className="font-heading text-lg font-bold mb-1" style={{ color: 'var(--pos-text)' }}>
        Croquis del restaurante
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--pos-text-muted)' }}>
        Toca una mesa para iniciar un pedido
      </p>

      {/* L-shaped container */}
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-sm"
        style={{
          paddingBottom: '90%',
          backgroundColor: 'var(--pos-card)',
          border: '2px solid var(--pos-border)',
        }}
      >
        {/* L-shape cutout: top-right corner */}
        <div
          className="absolute z-10 rounded-bl-xl"
          style={{
            top: 0,
            right: 0,
            width: '42%',
            height: '32%',
            backgroundColor: 'var(--pos-bg)',
            borderBottom: '2px solid var(--pos-border)',
            borderLeft: '2px solid var(--pos-border)',
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

        {/* Mesas — only principals and standalone */}
        {mesasARenderizar.map((mesa) => {
          const bbox = calcularBoundingBox(mesa, mesas)
          const mesasUnidas = mesa.unidaCon
            .map((id) => mesas.find((m) => m.id === id))
            .filter(Boolean) as Mesa[]

          return (
            <MesaCard
              key={mesa.id}
              mesa={mesa}
              mesasUnidas={mesasUnidas}
              posX={bbox.posX}
              posY={bbox.posY}
              ancho={bbox.ancho}
              alto={bbox.alto}
              onTap={() => handleMesaTap(mesa)}
            />
          )
        })}
      </div>

      {/* Modal de acción */}
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
