'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Scan, Loader2, CheckCircle, AlertTriangle, Camera, CameraOff, Keyboard, User, Coffee, UtensilsCrossed, Moon } from 'lucide-react'

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

interface EscanerQRProps {
  modo: string
  onEscaneado: (pensionista: any) => void
  onVolver: () => void
}

type MealType = 'DESAYUNO' | 'ALMUERZO' | 'CENA'

function detectMealType(): MealType | null {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes

  // Sin huecos: siempre hay un turno activo
  // 5:00 - 10:59 → DESAYUNO
  // 11:00 - 16:59 → ALMUERZO
  // 17:00 - 21:59 → CENA
  // 22:00 - 4:59 → null (madrugada, fuera de servicio)
  if (totalMinutes >= 300 && totalMinutes < 660) return 'DESAYUNO'   // 5:00 - 10:59
  if (totalMinutes >= 660 && totalMinutes < 1020) return 'ALMUERZO'  // 11:00 - 16:59
  if (totalMinutes >= 1020 && totalMinutes < 1320) return 'CENA'     // 17:00 - 21:59
  return null
}

function getMealLabel(meal: MealType): string {
  const labels: Record<MealType, string> = {
    DESAYUNO: 'Desayuno',
    ALMUERZO: 'Almuerzo',
    CENA: 'Cena',
  }
  return labels[meal]
}

function getMealIcon(meal: MealType) {
  if (meal === 'DESAYUNO') return <Coffee size={14} />
  if (meal === 'ALMUERZO') return <UtensilsCrossed size={14} />
  return <Moon size={14} />
}

function isBarcodeDetectorSupported(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window
}

export default function EscanerQR({ modo, onEscaneado, onVolver }: EscanerQRProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pensionista, setPensionista] = useState<PensionistaInfo | null>(null)
  const [registering, setRegistering] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const detectorRef = useRef<any>(null)

  const currentMeal = detectMealType()

  // Start camera
  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
      setScanning(true)
    } catch (err: any) {
      console.error('Camera error:', err)
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permiso de camara denegado. Usa el ingreso manual.'
          : 'No se pudo acceder a la camara. Usa el ingreso manual.'
      )
      setShowManualInput(true)
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setScanning(false)
  }, [])

  // Scan QR codes using BarcodeDetector API
  useEffect(() => {
    if (!scanning || !cameraActive || !videoRef.current) return

    if (!isBarcodeDetectorSupported()) {
      // If BarcodeDetector is not available, show manual fallback
      setCameraError('Tu navegador no soporta escaneo QR nativo. Usa Chrome o Edge, o ingresa el codigo manualmente.')
      setShowManualInput(true)
      return
    }

    // Initialize detector
    if (!detectorRef.current) {
      try {
        detectorRef.current = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
      } catch (e) {
        setCameraError('Error al inicializar el detector QR.')
        setShowManualInput(true)
        return
      }
    }

    const scanFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current)
        for (const barcode of barcodes) {
          const value = barcode.rawValue as string
          if (value && value.startsWith('PEN-')) {
            // Found a valid QR code
            setScanning(false)
            if (scanIntervalRef.current) {
              clearInterval(scanIntervalRef.current)
              scanIntervalRef.current = null
            }
            await validateQrToken(value)
            return
          }
        }
      } catch (err) {
        // Silently continue scanning
      }
    }

    scanIntervalRef.current = setInterval(scanFrame, 300)

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
        scanIntervalRef.current = null
      }
    }
  }, [scanning, cameraActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Validate QR token with backend
  const validateQrToken = async (qrToken: string) => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/proxy?path=/consumptions/validate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Error ${res.status}: No se pudo validar el QR`)
      }
      const data: PensionistaInfo = await res.json()
      setPensionista(data)
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al validar el codigo QR')
      // Resume scanning after error
      setScanning(true)
    } finally {
      setLoading(false)
    }
  }

  // Register consumption
  const registerConsumption = async () => {
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
        throw new Error(data.message || `Error ${res.status}: No se pudo registrar el consumo`)
      }
      const data = await res.json()
      setSuccessMessage(data.message || `${getMealLabel(currentMeal)} registrado para ${pensionista.name}`)
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar el consumo')
    } finally {
      setRegistering(false)
    }
  }

  // Handle manual code submit
  const handleManualSubmit = async () => {
    const code = manualCode.trim().toUpperCase()
    if (!code) return
    if (!code.startsWith('PEN-')) {
      setErrorMessage('El codigo debe comenzar con "PEN-"')
      return
    }
    await validateQrToken(code)
  }

  // Reset to scan another
  const handleReset = () => {
    setPensionista(null)
    setSuccessMessage(null)
    setErrorMessage(null)
    setManualCode('')
    if (cameraActive) {
      setScanning(true)
    }
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
          onClick={() => { stopCamera(); onVolver() }}
          className="touch-target w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 hover:opacity-75 active:scale-[0.95]"
          style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text-2)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="font-heading text-base font-bold leading-tight" style={{ color: 'var(--pos-text)' }}>
            Escanear QR
          </h2>
          <p className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>
            {currentMeal ? `${getMealLabel(currentMeal)} - Escanea el carnet digital` : 'Fuera de horario de comidas'}
          </p>
        </div>
        {/* Toggle manual input */}
        {!showManualInput && !pensionista && (
          <button
            onClick={() => setShowManualInput(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ border: '1px solid var(--pos-border)', color: 'var(--pos-text-muted)' }}
            title="Ingreso manual"
          >
            <Keyboard size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-4 gap-4 overflow-y-auto">
        {/* Success message */}
        {successMessage && (
          <div className="w-full max-w-sm">
            <div
              className="rounded-xl p-5 flex flex-col items-center gap-3 text-center animate-fade-in"
              style={{
                backgroundColor: 'var(--pos-success-bg)',
                border: '1px solid var(--pos-success)',
              }}
            >
              <CheckCircle size={48} style={{ color: 'var(--pos-success)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--pos-success)' }}>
                {successMessage}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="pos-btn pos-btn-primary w-full h-12 rounded-xl font-heading font-semibold text-sm mt-4 transition-all duration-150 active:scale-[0.97]"
              style={{ boxShadow: 'var(--pos-shadow-cyan)' }}
            >
              Escanear otro
            </button>
          </div>
        )}

        {/* Pensionista info card */}
        {pensionista && !successMessage && (
          <div
            className="w-full max-w-sm rounded-[20px] overflow-hidden animate-slide-up"
            style={{
              border: '1px solid var(--pos-border)',
              boxShadow: 'var(--pos-shadow-lg)',
              backgroundColor: 'var(--pos-card)',
            }}
          >
            {/* Gradient header */}
            <div
              className="px-6 py-5 flex items-center gap-4"
              style={{
                background: pensionista.is_active
                  ? 'linear-gradient(135deg, #0891b2 0%, #06B6D4 60%, #22d3ee 100%)'
                  : 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white font-heading font-bold text-lg"
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
                <h3 className="text-white font-heading font-bold text-base leading-tight truncate">
                  {pensionista.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.95)' }}
                  >
                    {pensionista.pensioner_type}
                  </span>
                  {pensionista.is_active && (
                    <CheckCircle size={14} className="text-white opacity-80" />
                  )}
                </div>
              </div>
            </div>

            {/* Info section */}
            <div className="px-5 py-4 space-y-3">
              {/* Balance */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>Saldo</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: pensionista.balance > 0 ? 'var(--pos-success)' : 'var(--pos-danger)' }}
                >
                  {pensionista.balance} comidas
                </span>
              </div>

              <div className="h-px" style={{ backgroundColor: 'var(--pos-divider)' }} />

              {/* Today's consumptions */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>Consumido hoy</span>
                <div className="flex gap-1.5">
                  {pensionista.todayConsumptions.length > 0 ? (
                    pensionista.todayConsumptions.map((meal) => (
                      <span
                        key={meal}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: 'var(--pos-primary-dim)', color: 'var(--pos-primary)' }}
                      >
                        {getMealLabel(meal as MealType)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--pos-text-muted)' }}>Ninguno</span>
                  )}
                </div>
              </div>

              <div className="h-px" style={{ backgroundColor: 'var(--pos-divider)' }} />

              {/* Current meal */}
              {currentMeal && (
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--pos-text-muted)' }}>Comida actual</span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--pos-primary)' }}>
                    {getMealIcon(currentMeal)}
                    {getMealLabel(currentMeal)}
                  </span>
                </div>
              )}

              {/* Already consumed warning */}
              {alreadyConsumed && (
                <div
                  className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--pos-danger-bg)',
                    border: '1px solid var(--pos-danger-border)',
                  }}
                >
                  <AlertTriangle size={15} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-danger)' }}>
                    Este pensionista ya registro {getMealLabel(currentMeal)} hoy.
                  </p>
                </div>
              )}

              {/* Not active warning */}
              {!pensionista.is_active && (
                <div
                  className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--pos-danger-bg)',
                    border: '1px solid var(--pos-danger-border)',
                  }}
                >
                  <AlertTriangle size={15} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-danger)' }}>
                    Esta cuenta de pensionista no esta activa.
                  </p>
                </div>
              )}

              {/* No meal time warning */}
              {!currentMeal && (
                <div
                  className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--pos-danger-bg)',
                    border: '1px solid var(--pos-danger-border)',
                  }}
                >
                  <AlertTriangle size={15} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-danger)' }}>
                    Fuera del horario de comidas. No se puede registrar consumo ahora.
                  </p>
                </div>
              )}

              {/* Error */}
              {errorMessage && (
                <div
                  className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--pos-danger-bg)',
                    border: '1px solid var(--pos-danger-border)',
                  }}
                >
                  <AlertTriangle size={15} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-danger)' }}>
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-5 pt-3 flex flex-col gap-2.5" style={{ borderTop: '1px solid var(--pos-border)' }}>
              {currentMeal && !alreadyConsumed && pensionista.is_active && (
                <button
                  onClick={registerConsumption}
                  disabled={registering}
                  className="pos-btn pos-btn-primary w-full h-12 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
                  style={{ boxShadow: 'var(--pos-shadow-cyan)' }}
                >
                  {registering ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Registrar {getMealLabel(currentMeal)}
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleReset}
                className="pos-btn pos-btn-ghost w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97]"
              >
                <Scan size={15} />
                Escanear otro
              </button>
            </div>
          </div>
        )}

        {/* Camera / Scanner View */}
        {!pensionista && !successMessage && (
          <>
            {/* Camera view */}
            {!showManualInput && (
              <div className="w-full max-w-sm">
                {/* Video container */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: '#111' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />

                  {/* Scanning overlay */}
                  {scanning && cameraActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Corner brackets */}
                      <div className="absolute top-4 left-4 w-10 h-10" style={{ borderTop: '3px solid var(--pos-primary)', borderLeft: '3px solid var(--pos-primary)', borderRadius: '4px 0 0 0' }} />
                      <div className="absolute top-4 right-4 w-10 h-10" style={{ borderTop: '3px solid var(--pos-primary)', borderRight: '3px solid var(--pos-primary)', borderRadius: '0 4px 0 0' }} />
                      <div className="absolute bottom-4 left-4 w-10 h-10" style={{ borderBottom: '3px solid var(--pos-primary)', borderLeft: '3px solid var(--pos-primary)', borderRadius: '0 0 0 4px' }} />
                      <div className="absolute bottom-4 right-4 w-10 h-10" style={{ borderBottom: '3px solid var(--pos-primary)', borderRight: '3px solid var(--pos-primary)', borderRadius: '0 0 4px 0' }} />

                      {/* Scanline */}
                      <div
                        className="absolute left-4 right-4 h-0.5 animate-scanline"
                        style={{ background: 'linear-gradient(to right, transparent, var(--pos-primary), transparent)' }}
                      />
                    </div>
                  )}

                  {/* Camera not started */}
                  {!cameraActive && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <Camera size={48} style={{ color: 'var(--pos-text-muted)', opacity: 0.5 }} />
                      <p className="text-xs text-center" style={{ color: 'var(--pos-text-muted)' }}>
                        Presiona para activar la camara
                      </p>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                      <Loader2 size={40} className="animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Camera error */}
                {cameraError && (
                  <div
                    className="mt-3 p-3 rounded-xl flex items-start gap-2.5"
                    style={{ backgroundColor: 'var(--pos-danger-bg)', border: '1px solid var(--pos-danger-border)' }}
                  >
                    <CameraOff size={15} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-danger)' }}>
                      {cameraError}
                    </p>
                  </div>
                )}

                {/* Error message */}
                {errorMessage && !pensionista && (
                  <div
                    className="mt-3 p-3 rounded-xl flex items-start gap-2.5"
                    style={{ backgroundColor: 'var(--pos-danger-bg)', border: '1px solid var(--pos-danger-border)' }}
                  >
                    <AlertTriangle size={15} className="shrink-0 mt-px" style={{ color: 'var(--pos-danger)' }} />
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--pos-danger)' }}>
                      {errorMessage}
                    </p>
                  </div>
                )}

                {/* Start/Stop camera button */}
                <div className="mt-4 flex flex-col gap-2">
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      className="pos-btn pos-btn-primary w-full h-12 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                      style={{ boxShadow: 'var(--pos-shadow-cyan)' }}
                    >
                      <Camera size={16} />
                      Activar camara
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="pos-btn pos-btn-ghost w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    >
                      <CameraOff size={15} />
                      Detener camara
                    </button>
                  )}

                  <button
                    onClick={() => { stopCamera(); setShowManualInput(true) }}
                    className="pos-btn pos-btn-ghost w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  >
                    <Keyboard size={15} />
                    Ingreso manual
                  </button>
                </div>
              </div>
            )}

            {/* Manual input fallback */}
            {showManualInput && (
              <div className="w-full max-w-sm space-y-4">
                <div className="text-center">
                  <Keyboard size={40} style={{ color: 'var(--pos-primary)', opacity: 0.6, margin: '0 auto' }} />
                  <p className="text-sm mt-2 font-medium" style={{ color: 'var(--pos-text)' }}>
                    Ingreso manual de codigo
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--pos-text-muted)' }}>
                    Escribe el codigo QR del pensionista (ej: PEN-ABC123)
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => { setManualCode(e.target.value.toUpperCase()); setErrorMessage(null) }}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                    placeholder="PEN-XXXXX"
                    className="flex-1 h-12 px-4 rounded-xl text-sm outline-none font-mono tracking-wider"
                    style={{
                      backgroundColor: 'var(--pos-card)',
                      border: '1px solid var(--pos-border)',
                      color: 'var(--pos-text)',
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={loading || !manualCode.trim()}
                    className="h-12 px-5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ backgroundColor: 'var(--pos-primary)' }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Scan size={16} />}
                  </button>
                </div>

                {errorMessage && (
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

                {/* Switch back to camera */}
                <button
                  onClick={() => { setShowManualInput(false); setErrorMessage(null); startCamera() }}
                  className="pos-btn pos-btn-ghost w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                >
                  <Camera size={15} />
                  Usar camara
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
