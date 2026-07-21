'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { REDES, DEPARTAMENTOS } from '@/lib/redes'

type DatosReporte = {
  adultos: number | null
  ninos: number | null
  hubo_ofrenda: boolean | null
  monto_ofrenda: number | null
  moneda_ofrenda: string | null
  nombre_grupo: string | null
  nombre_empresa: string | null
}

type ReporteExistente = {
  id: string
  adultos: number | null
  ninos: number | null
  hubo_ofrenda: boolean | null
  monto_ofrenda: number | null
  moneda_ofrenda: string | null
  nombre_grupo: string | null
  nombre_empresa: string | null
} | null

type Props = {
  devocionalId: string
  userId: string
  tipo: 'familiar' | 'grupal' | 'empresarial'
  reporteExistente?: ReporteExistente
  onClose: () => void
  onSuccess: (datos?: DatosReporte) => void
}

const MONEDAS = [
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'Bs', label: 'Bolívares (Bs)' },
  { value: 'Pesos', label: 'Pesos' },
]

const TITULO: Record<string, string> = {
  familiar: 'Reporte familiar',
  grupal: 'Reporte de grupo',
  empresarial: 'Reporte empresarial',
}

export default function ReporteModal({ devocionalId, userId, tipo, reporteExistente, onClose, onSuccess }: Props) {
  const esEdicion = !!reporteExistente
  const [participantes, setParticipantes] = useState(
    tipo !== 'familiar' ? (reporteExistente?.adultos ?? 1) : 1
  )
  const [adultos, setAdultos] = useState(reporteExistente?.adultos ?? 1)
  const [ninos, setNinos] = useState(reporteExistente?.ninos ?? 0)
  const [nombreGrupo, setNombreGrupo] = useState(reporteExistente?.nombre_grupo ?? '')
  const [nombreEmpresa, setNombreEmpresa] = useState(reporteExistente?.nombre_empresa ?? '')
  const [red, setRed] = useState('')
  const [huboOfrenda, setHuboOfrenda] = useState(reporteExistente?.hubo_ofrenda ?? false)
  const [moneda, setMoneda] = useState(reporteExistente?.moneda_ofrenda ?? 'USD')
  const [montoOfrenda, setMontoOfrenda] = useState(reporteExistente?.monto_ofrenda ? String(reporteExistente.monto_ofrenda) : '')
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function enviarReporte() {
    if (tipo === 'grupal' && !nombreGrupo.trim()) {
      setError('Por favor ingresa el nombre del grupo.')
      return
    }
    if (tipo === 'empresarial' && !nombreEmpresa.trim()) {
      setError('Por favor ingresa el nombre de la empresa.')
      return
    }
    if (!esEdicion && !red) {
      setError('Por favor selecciona tu red o departamento.')
      return
    }

    setEnviando(true)
    setError('')

    const totalPersonas = tipo === 'familiar' ? adultos + ninos : participantes
    const datos = {
      adultos: tipo === 'familiar' ? adultos : participantes,
      ninos: tipo === 'familiar' ? ninos : 0,
      personas_participaron: totalPersonas,
      nombre_grupo: tipo === 'grupal' ? nombreGrupo.trim() : null,
      nombre_empresa: tipo === 'empresarial' ? nombreEmpresa.trim() : null,
      hubo_ofrenda: huboOfrenda,
      monto_ofrenda: huboOfrenda && montoOfrenda ? parseFloat(montoOfrenda) : null,
      moneda_ofrenda: huboOfrenda ? moneda : null,
    }

    const { error: err } = esEdicion
      ? await supabase.from('reportes').update(datos).eq('id', reporteExistente!.id)
      : await supabase.from('reportes').insert({
        devocional_id: devocionalId,
        user_id: userId,
        tipo,
        ...datos,
        red: red.trim() || null,
        nota: nota || null,
      })

    setEnviando(false)
    if (err) { setError(`Error al enviar el reporte: ${err.message}`); return }

    onSuccess({
      ...datos,
      nombre_grupo: datos.nombre_grupo,
      nombre_empresa: datos.nombre_empresa,
    })
  }

  const Contador = ({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 rounded-full border border-gray-200 bg-white text-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center">−</button>
        <span className="text-2xl font-bold text-primary w-8 text-center">{value}</span>
        <button onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full border border-gray-200 bg-white text-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center">+</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{esEdicion ? `Corregir reporte ${tipo}` : TITULO[tipo]}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Campos específicos por tipo */}
        {tipo === 'grupal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del grupo <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="Ej: Grupo de jóvenes, Grupo de mujeres..."
              value={nombreGrupo} onChange={e => setNombreGrupo(e.target.value)} className="input" />
          </div>
        )}

        {tipo === 'empresarial' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la empresa del sueño <span className="text-red-400">*</span>
            </label>
            <input type="text" placeholder="Ej: Panadería La Bendición..."
              value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)} className="input" />
          </div>
        )}

        {/* Participantes */}
        {tipo === 'familiar' ? (
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
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Cuántas personas participaron?
            </label>
            <div className="flex gap-3">
              <Contador label="Participantes" value={participantes} onChange={setParticipantes} min={1} />
            </div>
          </div>
        )}

        {/* Red o Departamento */}
        {!esEdicion && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Red o Departamento <span className="text-red-400">*</span>
            </label>
            <select value={red} onChange={e => setRed(e.target.value)} className="input">
              <option value="">Selecciona una opción...</option>
              <optgroup label="Redes">
                {REDES.map(r => <option key={r} value={r}>Red {r}</option>)}
              </optgroup>
              <optgroup label="Departamentos">
                {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
              </optgroup>
            </select>
            <p className="text-xs text-gray-400 mt-1">Elige tu red o tu departamento (una sola opción).</p>
          </div>
        )}

        {/* Ofrenda */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">¿Hubo ofrenda?</label>
          <div className="flex gap-3">
            {[true, false].map(val => (
              <button key={String(val)} onClick={() => setHuboOfrenda(val)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  huboOfrenda === val ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {val ? 'Sí' : 'No'}
              </button>
            ))}
          </div>
          {huboOfrenda && (
            <div className="space-y-2">
              <div className="flex gap-2">
                {MONEDAS.map(m => (
                  <button key={m.value} onClick={() => setMoneda(m.value)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                      moneda === m.value ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  {moneda === 'Bs' ? 'Bs.' : '$'}
                </span>
                <input type="number" placeholder="Monto aproximado (opcional)"
                  value={montoOfrenda} onChange={e => setMontoOfrenda(e.target.value)} className="input pl-9" />
              </div>
            </div>
          )}
        </div>

        {/* Nota */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nota o testimonio <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea rows={2} placeholder="Algo que quieras compartir..."
            value={nota} onChange={e => setNota(e.target.value)} className="input resize-none" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button onClick={enviarReporte} disabled={enviando} className="btn-primary w-full py-3.5 text-base">
          {enviando ? 'Guardando...' : esEdicion ? 'Guardar corrección' : 'Enviar reporte'}
        </button>
      </div>
    </div>
  )
}
