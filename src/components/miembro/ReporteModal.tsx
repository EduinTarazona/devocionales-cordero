'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type DatosReporte = {
  adultos: number | null
  ninos: number | null
  hubo_ofrenda: boolean | null
  monto_ofrenda: number | null
  moneda_ofrenda: string | null
}

type Props = {
  devocionalId: string
  userId: string
  onClose: () => void
  onSuccess: (datos?: DatosReporte) => void
}

const MONEDAS = [
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'Bs', label: 'Bolívares (Bs)' },
  { value: 'Pesos', label: 'Pesos' },
]

export default function ReporteModal({ devocionalId, userId, onClose, onSuccess }: Props) {
  const [adultos, setAdultos] = useState(1)
  const [ninos, setNinos] = useState(0)
  const [red, setRed] = useState('')
  const [huboOfrenda, setHuboOfrenda] = useState(false)
  const [moneda, setMoneda] = useState('USD')
  const [montoOfrenda, setMontoOfrenda] = useState('')
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function enviarReporte() {
    setEnviando(true)
    setError('')
    const { error } = await supabase.from('reportes').insert({
      devocional_id: devocionalId,
      user_id: userId,
      adultos,
      ninos,
      personas_participaron: adultos + ninos,
      red: red.trim() || null,
      hubo_ofrenda: huboOfrenda,
      monto_ofrenda: huboOfrenda && montoOfrenda ? parseFloat(montoOfrenda) : null,
      moneda_ofrenda: huboOfrenda ? moneda : null,
      nota: nota || null,
    })
    setEnviando(false)
    if (error) { setError('Error al enviar el reporte. Intenta de nuevo.'); return }
    onSuccess({
      adultos,
      ninos,
      hubo_ofrenda: huboOfrenda,
      monto_ofrenda: huboOfrenda && montoOfrenda ? parseFloat(montoOfrenda) : null,
      moneda_ofrenda: huboOfrenda ? moneda : null,
    })
  }

  const Contador = ({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 rounded-full border border-gray-200 bg-white text-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
        >−</button>
        <span className="text-2xl font-bold text-primary w-8 text-center">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full border border-gray-200 bg-white text-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
        >+</button>
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Reporte de devocional</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Participantes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Cuántas personas participaron?
          </label>
          <div className="flex gap-3">
            <Contador label="Adultos" value={adultos} onChange={setAdultos} min={1} />
            <Contador label="Niños" value={ninos} onChange={setNinos} min={0} />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            Total: <span className="font-semibold text-primary">{adultos + ninos}</span> personas
          </p>
        </div>

        {/* Red */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Red <span className="text-gray-400 font-normal">(número de red)</span>
          </label>
          <input
            type="text"
            placeholder="Ej: 1, 2, 3..."
            value={red}
            onChange={e => setRed(e.target.value)}
            className="input"
          />
        </div>

        {/* Ofrenda */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            ¿Hubo ofrenda familiar?
          </label>
          <div className="flex gap-3">
            {[true, false].map(val => (
              <button
                key={String(val)}
                onClick={() => setHuboOfrenda(val)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  huboOfrenda === val
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {val ? 'Sí' : 'No'}
              </button>
            ))}
          </div>

          {huboOfrenda && (
            <div className="space-y-2">
              {/* Selector moneda */}
              <div className="flex gap-2">
                {MONEDAS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMoneda(m.value)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                      moneda === m.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {/* Monto */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  {moneda === 'USD' ? '$' : moneda === 'Bs' ? 'Bs.' : '$'}
                </span>
                <input
                  type="number"
                  placeholder="Monto aproximado (opcional)"
                  value={montoOfrenda}
                  onChange={e => setMontoOfrenda(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
          )}
        </div>

        {/* Nota opcional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nota o testimonio <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Algo que quieras compartir con el pastor..."
            value={nota}
            onChange={e => setNota(e.target.value)}
            className="input resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={enviarReporte}
          disabled={enviando}
          className="btn-primary w-full py-3.5 text-base"
        >
          {enviando ? 'Enviando...' : 'Enviar reporte'}
        </button>
      </div>
    </div>
  )
}
