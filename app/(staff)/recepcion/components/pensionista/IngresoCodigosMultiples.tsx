'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Search, Loader2, CheckCircle, AlertTriangle, User, Coffee, UtensilsCrossed, Moon, RotateCcw, Clock } from 'lucide-react'

interface PensionistaInfo {
  id: number
  name: string
  email: string
  pensioner_type: string
  balance: number
  is_active: boolean
  qr_token: string
  todayConsumptions: string[]
}

interface RegisteredEntry {
  pensionista: PensionistaInfo
  mealType: string
  time: string
}

interface IngresoCodigosMultiplesProps {
  mesaId: string
  onTodosConfirmados: () => void
  onVolver: () => void
}

type MealType = 'DESAYUNO' | 'ALMUERZO' | 'CENA'

function detectMealType(): MealType | null {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes

  if (totalMinutes >= 360 && totalMinutes < 600) return 'DESAYUNO'    // 6:00 - 10:00
  if (totalMinutes >= 690 && totalMinutes < 900) return 'ALMUERZO'    // 11:30 - 15:00
  if (totalMinutes >= 1050 && totalMinutes < 1260) return 'CENA'      // 17:30 - 21:00
  return null
}

function getMealLabel(meal: MealType | string): string {
  const labels: Record<string, string> = {
    DESAYUNO: 'Desayuno',
    ALMUERZO: 'Almuerzo',
    CENA: 'Cena',
  }
  return labels[meal] || meal
}

function getMealIcon(meal: MealType) {
  if (meal === 'DESAYUNO') return <Coffee size={14} />
  if (meal === 'ALMUERZO') return <UtensilsCrossed size={14} />
  return <Moon size={14} />
}

export default function IngresoCodigosMultiples({ mesaId, onTodosConfirmados, onVolver }: IngresoCodigosMultiplesProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [pensionista, setPensionista] = useState<PensionistaInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [registeredToday, setRegisteredToday] = useState<RegisteredEntry[]>([])

  const currentMeal = detectMealType()

  // Validate QR code
  const handleSubmit = useCallback(async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return

    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    setPensionista(null)

    try {
      const res = await fetch('/api/proxy?path=/consumptions/validate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: trimmed }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Error ${res.status}: Codigo no valido`)
      }
      const data: PensionistaInfo = await res.json()
      setPensionista(data)
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al validar el codigo')
    } finally {
      setLoading(false)
    }
  }, [code])

  // Register consumption
  const registerConsumption = useCallback(async () => {
    if (!pensionista || !currentMeal) return

    setRegistering(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/proxy?path=/consumptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pensionista.id, mealType: currentMeal }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Error ${res.status}: No se pudo registrar`)
      }
      const data = await res.json()

      // Add to registered list
      const now = new Date()
      setRegisteredToday(prev => [
        {
          pensionista,
          mealType: currentMeal,
          time: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ])

      setSuccessMessage(data.message || `${getMealLabel(currentMeal)} registrado para ${pensionista.name}`)

      // Reset for next entry after a brief moment
      setTimeout(() => {
        setPensionista(null)
        setSuccessMessage(null)
        setCode('')
      }, 2000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar el consumo')
    } finally {
      setRegistering(false)
    }
  }, [pensionista, currentMeal])

  // Reset current pensionista
  const handleReset = () => {
    setPensionista(null)
    setSuccessMessage(null)
    setErrorMessage(null)
    setCode('')
  }

  const alreadyConsumed = pensionista && currentMeal && pensionista.todayConsumptions.includes(currentMeal)

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ backgroundColor: 'var(--pos-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--pos-border)',
          backgroundColor: 'var(--pos-card)',
          boxShadow: 'var(--pos-shadow-sm)',
        }}
      >
        <button
          onClick={onVolver}
          className="touch-target w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 hover:opacity-75 active:scale-[0.95]"
          style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text-2)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="font-heading text-base font-bold leading-tight" style={{ color: 'var(--pos-text)' }}>
            Ingresar codigo
          </h2>
          <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
            {currentMeal ? `${getMealLabel(currentMeal)} - Registro manual` : 'Fuera de horario de comidas'}
          </p>
        </div>
        {registeredToday.length > 0 && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'var(--pos-success-bg)', color: 'var(--pos-success)' }}
          >
            {registeredToday.length} hoy
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Code input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--pos-text-muted)' }} />
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setErrorMessage(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="PEN-XXXXX"
              className="w-full h-12 pl-10 pr-4 rounded-xl text-sm outline-none font-mono tracking-wider"
              style={{
                backgroundColor: 'var(--pos-card)',
                border: '1px solid var(--pos-border)',
                color: 'var(--pos-text)',
              }}
              disabled={!!pensionista}
              autoFocus
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !code.trim() || !!pensionista}
            className="h-12 px-5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: 'var(--pos-primary)' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Buscar
          </button>
        </div>

        {/* Error */}
        {errorMessage && !pensionista && (
          <div
            className="p-3 rounded-xl flex items-start gap-2.5"
            style={{ backgroundColor: 'var(--pos-danger-bg)', border: '1px solid var(--pos-danger-border)' }}
          >
            <AlertTriangle size={15} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-danger)' }}>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div
            className="p-4 rounded-xl flex items-center gap-3 animate-fade-in"
            style={{ backgroundColor: 'var(--pos-success-bg)', border: '1px solid var(--pos-success)' }}
          >
            <CheckCircle size={20} style={{ color: 'var(--pos-success)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--pos-success)' }}>
              {successMessage}
            </p>
          </div>
        )}

        {/* Pensionista info card */}
        {pensionista && !successMessage && (
          <div
            className="rounded-[20px] overflow-hidden animate-slide-up"
            style={{
              border: '1px solid var(--pos-border)',
              boxShadow: 'var(--pos-shadow-lg)',
              backgroundColor: 'var(--pos-card)',
            }}
          >
            {/* Header gradient */}
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{
                background: pensionista.is_active
                  ? 'linear-gradient(135deg, #0891b2 0%, #06B6D4 60%, #22d3ee 100%)'
                  : 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-heading font-bold text-base"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              >
                {pensionista.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-heading font-bold text-sm leading-tight truncate">
                  {pensionista.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.95)' }}
                  >
                    {pensionista.pensioner_type}
                  </span>
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
                  >
                    {pensionista.qr_token}
                  </span>
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div className="px-5 py-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Saldo</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: pensionista.balance > 0 ? 'var(--pos-success)' : 'var(--pos-danger)' }}
                >
                  {pensionista.balance} comidas
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Consumido hoy</span>
                <div className="flex gap-1">
                  {pensionista.todayConsumptions.length > 0 ? (
                    pensionista.todayConsumptions.map((meal) => (
                      <span
                        key={meal}
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: 'var(--pos-primary-dim)', color: 'var(--pos-primary)' }}
                      >
                        {getMealLabel(meal)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Ninguno</span>
                  )}
                </div>
              </div>

              {/* Warnings */}
              {alreadyConsumed && (
                <div
                  className="flex items-start gap-2 p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--pos-danger-bg)', border: '1px solid var(--pos-danger-border)' }}
                >
                  <AlertTriangle size={14} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                  <p className="text-xs" style={{ color: 'var(--pos-danger)' }}>
                    Ya registro {currentMeal && getMealLabel(currentMeal)} hoy.
                  </p>
                </div>
              )}

              {!pensionista.is_active && (
                <div
                  className="flex items-start gap-2 p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--pos-danger-bg)', border: '1px solid var(--pos-danger-border)' }}
                >
                  <AlertTriangle size={14} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                  <p className="text-xs" style={{ color: 'var(--pos-danger)' }}>
                    Cuenta no activa.
                  </p>
                </div>
              )}

              {!currentMeal && (
                <div
                  className="flex items-start gap-2 p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--pos-danger-bg)', border: '1px solid var(--pos-danger-border)' }}
                >
                  <AlertTriangle size={14} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                  <p className="text-xs" style={{ color: 'var(--pos-danger)' }}>
                    Fuera del horario de comidas.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div
                  className="flex items-start gap-2 p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--pos-danger-bg)', border: '1px solid var(--pos-danger-border)' }}
                >
                  <AlertTriangle size={14} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                  <p className="text-xs" style={{ color: 'var(--pos-danger)' }}>
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 pt-2 flex gap-2" style={{ borderTop: '1px solid var(--pos-border)' }}>
              <button
                onClick={handleReset}
                className="flex-1 h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text-muted)' }}
              >
                <RotateCcw size={14} />
                Cancelar
              </button>
              {currentMeal && !alreadyConsumed && pensionista.is_active && (
                <button
                  onClick={registerConsumption}
                  disabled={registering}
                  className="flex-[2] h-11 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
                  style={{ backgroundColor: 'var(--pos-primary)', boxShadow: 'var(--pos-shadow-cyan)' }}
                >
                  {registering ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      Registrar {getMealLabel(currentMeal)}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Registered today list */}
        {registeredToday.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--pos-text-muted)' }}>
              <Clock size={12} />
              Registrados hoy ({registeredToday.length})
            </h3>
            <div className="space-y-1.5">
              {registeredToday.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--pos-success-bg)', border: '1px solid var(--pos-success)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={14} style={{ color: 'var(--pos-success)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--pos-text)' }}>
                        {entry.pensionista.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
                        {entry.pensionista.pensioner_type} - {entry.pensionista.qr_token}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: 'var(--pos-success)' }}>
                      {getMealLabel(entry.mealType)}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--pos-text-muted)' }}>
                      {entry.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
