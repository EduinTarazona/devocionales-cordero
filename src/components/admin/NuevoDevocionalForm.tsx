'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NuevoDevocionalForm({ onPublicado }: { onPublicado: () => void }) {
  const [form, setForm] = useState({
    titulo: '', tipo: 'familiar', pasaje: '', referencia: '',
    contenido: '', dinamica: '', oracion: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function publicar() {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setError('El titulo y el contenido son obligatorios.')
      return
    }
    setGuardando(true)
    setError('')

    // Desactivar devocional anterior
    await supabase.from('devocionales').update({ activo: false }).eq('activo', true)

    const { error } = await supabase.from('devocionales').insert({ ...form, activo: true })
    setGuardando(false)
    if (error) { setError('Error al publicar. Intenta de nuevo.'); return }
    onPublicado()
  }

  const campo = (label: string, key: string, multiline = false, obligatorio = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {obligatorio && <span className="text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea
          rows={4}
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
      <h2 className="font-bold text-gray-900">Nuevo devocional</h2>

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
      {campo('Dinamica familiar', 'dinamica', true)}
      {campo('Oracion sugerida', 'oracion', true)}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={publicar}
        disabled={guardando}
        className="btn-primary w-full py-3"
      >
        {guardando ? 'Publicando...' : 'Publicar devocional'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Al publicar, el devocional anterior quedara inactivo automaticamente.
      </p>
    </div>
  )
}
