'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  devocionalId: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export default function ReporteModal({ devocionalId, userId, onClose, onSuccess }: Props) {
  const [personas, setPersonas] = useState(1)
  const [huboOfrenda, setHuboOfrenda] = useState(false)
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
      personas_participaron: personas,
      hubo_ofrenda: huboOfrenda,
      monto_ofrenda: huboOfrenda && montoOfrenda ? parseFloat(montoOfrenda) : null,
      nota: nota || null,
    })
    setEnviando(false)
    if (error) { setError('Error al enviar el reporte. Intenta de nuevo.'); return }
    onSuccess()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 space-y-5">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Reporte de devocional</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Personas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Cuantas personas participaron?
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPersonas(Math.max(1, personas - 1))}
              className="w-10 h-10 rounded-full border border-gray-200 text-xl font-medium hover:bg-gray-50 transition-colors"
            >−</button>
            <span className="text-2xl font-bold text-primary w-8 text-center">{personas}</span>
            <button
              onClick={() => setPersonas(personas + 1)}
              className="w-10 h-10 rounded-full border border-gray-200 text-xl font-medium hover:bg-gray-50 transition-colors"
            >+</button>
          </div>
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
                {val ? 'Si' : 'No'}
              </button>
            ))}
          </div>
          {huboOfrenda && (
            <input
              type="number"
              placeholder="Monto aproximado (opcional)"
              value={montoOfrenda}
              onChange={e => setMontoOfrenda(e.target.value)}
              className="input"
            />
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
