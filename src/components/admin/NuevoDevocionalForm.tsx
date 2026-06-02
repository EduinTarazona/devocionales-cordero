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
  const [imagen, setImagen] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagen(file)
    setImagenPreview(URL.createObjectURL(file))
  }

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

    // Subir imagen si hay una
    let imagen_url = null
    if (imagen) {
      const ext = imagen.name.split('.').pop()
      const nombre = `devocional-${Date.now()}.${ext}`
      const { data: upload, error: uploadError } = await supabase.storage
        .from('devocionales')
        .upload(nombre, imagen, { upsert: true })
      if (uploadError) { setError('Error al subir la imagen.'); setGuardando(false); return }
      const { data: urlData } = supabase.storage.from('devocionales').getPublicUrl(nombre)
      imagen_url = urlData.publicUrl
    }

    await supabase.from('devocionales').update({ activo: false }).eq('activo', true)
    const { error } = await supabase.from('devocionales').insert({ ...form, imagen_url, activo: true })
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

        {/* Subir imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen ilustrativa <span className="text-xs text-gray-400">(opcional)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B3B8E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-sm text-gray-500">{imagen ? imagen.name : 'Seleccionar imagen'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImagen} />
          </label>
          {imagenPreview && (
            <img src={imagenPreview} alt="Preview" className="mt-2 rounded-xl w-full max-h-48 object-cover" />
          )}
        </div>
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
