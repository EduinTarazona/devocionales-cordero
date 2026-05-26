'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EditarDevocionalForm({ devocional, onGuardado }: { devocional: any; onGuardado: () => void }) {
  const [form, setForm] = useState({
    semana:    devocional.semana    ?? '',
    titulo:    devocional.titulo    ?? '',
    tipo:      devocional.tipo      ?? 'familiar',
    pasaje:    devocional.pasaje    ?? '',
    referencia: devocional.referencia ?? '',
    contenido: devocional.contenido ?? '',
    oracion:   devocional.oracion   ?? '',
  })
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function guardar() {
    if (!form.semana.trim() || !form.titulo.trim() || !form.contenido.trim()) {
      setError('La semana, el titulo y el contenido son obligatorios.')
      return
    }
    setGuardando(true)
    setError('')
    const { error } = await supabase
      .from('devocionales')
      .update({ ...form })
      .eq('id', devocional.id)
    setGuardando(false)
    if (error) { setError('Error al guardar. Intenta de nuevo.'); return }
    onGuardado()
  }

  async function eliminar() {
    setEliminando(true)
    await supabase.from('devocionales').delete().eq('id', devocional.id)
    window.location.assign('/admin')
  }

  const campo = (label: string, key: string, multiline = false, obligatorio = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {obligatorio && <span className="text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea
          rows={5}
          value={(form as any)[key]}
          onChange={e => set(key, e.target.value)}
          className="input resize-none"
        />
      ) : (
        <input
          type="text"
          value={(form as any)[key]}
          onChange={e => set(key, e.target.value)}
          className="input"
        />
      )}
    </div>
  )

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Editar devocional</h2>
        <span className="badge bg-primary-light text-primary text-xs">
          {devocional.tipo === 'familiar' ? 'Familiar' : devocional.tipo === 'grupal' ? 'Grupal' : 'Empresarial'}
        </span>
      </div>

      {campo('Semana', 'semana', false, true)}
      {campo('Titulo', 'titulo', false, true)}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className="input">
          <option value="familiar">Familiar</option>
          <option value="grupal">Grupal</option>
          <option value="empresarial">Empresarial</option>
        </select>
      </div>

      {campo('Versiculo / Pasaje', 'pasaje')}
      {campo('Referencia biblica (ej: Mateo 18:19)', 'referencia')}
      {campo('Contenido / Desarrollo', 'contenido', true, true)}
      {campo('Oracion sugerida', 'oracion', true)}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={guardar}
        disabled={guardando}
        className="btn-primary w-full py-3"
      >
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {/* Zona de peligro — eliminar */}
      <div className="border-t border-gray-100 pt-4">
        {!confirmarEliminar ? (
          <button
            onClick={() => setConfirmarEliminar(true)}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Eliminar devocional
          </button>
        ) : (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-3">
            <p className="text-sm font-semibold text-red-700">¿Seguro que quieres eliminar este devocional?</p>
            <p className="text-xs text-red-500">Esta acción también eliminará todos los reportes asociados. No se puede deshacer.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmarEliminar(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={eliminar}
                disabled={eliminando}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
              >
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
