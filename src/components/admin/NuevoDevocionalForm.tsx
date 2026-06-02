'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function semanaActual(): string {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diffLunes = (dia === 0 ? -6 : 1 - dia)
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() + diffLunes)
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  const anio = String(domingo.getFullYear()).slice(2)
  return `${fmt(lunes)} al ${fmt(domingo)}/${anio}`
}

export default function NuevoDevocionalForm({ onPublicado }: { onPublicado: () => void }) {
  const [form, setForm] = useState({
    semana: semanaActual(), serie: '', titulo: '', tipo: 'familiar',
    pasaje: '', referencia: '', introduccion: '',
    contenido: '', intercambiemos_ideas: '', oracion: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function publicar() {
    if (!form.semana.trim() || !form.titulo.trim() || !form.contenido.trim()) {
      setError('La semana, el título y el contenido son obligatorios.')
      return
    }
    setGuardando(true)
    setError('')
    await supabase.from('devocionales').update({ activo: false }).eq('activo', true)
    const { error } = await supabase.from('devocionales').insert({ ...form, activo: true })
    setGuardando(false)
    if (error) { setError('Error al publicar. Intenta de nuevo.'); return }
    onPublicado()
  }

  const campo = (label: string, key: string, multiline = false, obligatorio = false, ayuda = '') => (
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
      {ayuda && <p className="text-xs text-gray-400 mt-1">{ayuda}</p>}
    </div>
  )

  return (
    <div className="card space-y-5">
      <h2 className="font-bold text-gray-900">Nuevo devocional</h2>

      {/* Identificación */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Identificación</p>
        {campo('Serie', 'serie', false, false, 'Ej: Carácter Cristiano: Fruto del Espíritu')}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semana <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.semana}
            onChange={e => set('semana', e.target.value)}
            className="input bg-primary/5 font-medium"
          />
          <p className="text-xs text-gray-400 mt-1">Calculada automáticamente. Puedes editarla si es necesario.</p>
        </div>
        {campo('Título', 'titulo', false, true)}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className="input">
            <option value="familiar">Familiar</option>
            <option value="grupal">Grupal</option>
            <option value="empresarial">Empresarial</option>
          </select>
        </div>
      </div>

      {/* A) Leamos Juntos */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#3B3B8E' }}>
          A) Leamos Juntos
        </p>
        {campo('Versículo / Pasaje', 'pasaje', true)}
        {campo('Referencia bíblica', 'referencia', false, false, 'Ej: Gálatas 5:22-23,25')}
        {campo('Introducción', 'introduccion', true, false, 'Opcional — párrafo de contexto después del versículo')}
      </div>

      {/* B) Aprendemos en Familia */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#3B3B8E' }}>
          B) Aprendemos en Familia
        </p>
        {campo('Contenido / Desarrollo', 'contenido', true, true)}
      </div>

      {/* Intercambiemos Ideas */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#F7941D' }}>
          Intercambiemos Ideas
        </p>
        {campo('Preguntas de reflexión', 'intercambiemos_ideas', true, false, 'Ej: 1) ¿Identificas cuáles características necesitas desarrollar?')}
      </div>

      {/* C) Oracion */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#3B3B8E' }}>
          C) Tomamos tiempo para agradecer y orar
        </p>
        {campo('Oración sugerida', 'oracion', true)}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={publicar}
        disabled={guardando}
        className="btn-primary w-full py-3"
      >
        {guardando ? 'Publicando...' : 'Publicar devocional'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Al publicar, el devocional anterior quedará inactivo automáticamente.
      </p>
    </div>
  )
}
