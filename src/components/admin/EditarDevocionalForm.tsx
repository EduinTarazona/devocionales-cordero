'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EditarDevocionalForm({ devocional, onGuardado }: { devocional: any; onGuardado: () => void }) {
  const [form, setForm] = useState({
    semana:               devocional.semana               ?? '',
    serie:                devocional.serie                ?? '',
    titulo:               devocional.titulo               ?? '',
    tipo:                 devocional.tipo                 ?? 'familiar',
    pasaje:               devocional.pasaje               ?? '',
    referencia:           devocional.referencia           ?? '',
    introduccion:         devocional.introduccion         ?? '',
    contenido:            devocional.contenido            ?? '',
    intercambiemos_ideas: devocional.intercambiemos_ideas ?? '',
    oracion:              devocional.oracion              ?? '',
  })
  const [imagen, setImagen] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(devocional.imagen_url ?? null)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagen(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  async function guardar() {
    if (!form.semana.trim() || !form.titulo.trim() || !form.contenido.trim()) {
      setError('La semana, el título y el contenido son obligatorios.')
      return
    }
    setGuardando(true)
    setError('')

    let imagen_url = devocional.imagen_url ?? null
    if (imagen) {
      const ext = imagen.name.split('.').pop()
      const nombre = `devocional-${devocional.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('devocionales')
        .upload(nombre, imagen, { upsert: true })
      if (uploadError) { setError('Error al subir la imagen.'); setGuardando(false); return }
      const { data: urlData } = supabase.storage.from('devocionales').getPublicUrl(nombre)
      imagen_url = urlData.publicUrl
    }

    const { error } = await supabase
      .from('devocionales')
      .update({ ...form, imagen_url })
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

  const campo = (label: string, key: string, multiline = false, obligatorio = false, ayuda = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {obligatorio && <span className="text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea rows={4} value={(form as any)[key]} onChange={e => set(key, e.target.value)} className="input resize-none" />
      ) : (
        <input type="text" value={(form as any)[key]} onChange={e => set(key, e.target.value)} className="input" />
      )}
      {ayuda && <p className="text-xs text-gray-400 mt-1">{ayuda}</p>}
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

      {/* Identificación */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Identificación</p>
        {campo('Serie', 'serie', false, false, 'Ej: Carácter Cristiano: Fruto del Espíritu')}
        {campo('Semana', 'semana', false, true)}
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
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#3B3B8E' }}>A) Leamos Juntos</p>
        {campo('Versículo / Pasaje', 'pasaje', true)}
        {campo('Referencia bíblica', 'referencia', false, false, 'Ej: Gálatas 5:22-23,25')}
        {campo('Introducción', 'introduccion', true, false, 'Opcional — párrafo de contexto después del versículo')}
      </div>

      {/* B) Aprendemos en Familia */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#3B3B8E' }}>B) Aprendemos en Familia</p>
        {campo('Contenido / Desarrollo', 'contenido', true, true)}

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen ilustrativa <span className="text-xs text-gray-400">(opcional)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B3B8E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-sm text-gray-500">{imagen ? imagen.name : 'Cambiar imagen'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImagen} />
          </label>
          {imagenPreview && (
            <img src={imagenPreview} alt="Preview" className="mt-2 rounded-xl w-full max-h-48 object-cover" />
          )}
        </div>
      </div>

      {/* Intercambiemos Ideas */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#F7941D' }}>Intercambiemos Ideas</p>
        {campo('Preguntas de reflexión', 'intercambiemos_ideas', true, false, 'Ej: 1) ¿Identificas cuáles características necesitas desarrollar?')}
      </div>

      {/* C) Oración */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#3B3B8E' }}>C) Tomamos tiempo para agradecer y orar</p>
        {campo('Oración sugerida', 'oracion', true)}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button onClick={guardar} disabled={guardando} className="btn-primary w-full py-3">
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {/* Eliminar */}
      <div className="border-t border-gray-100 pt-4">
        {!confirmarEliminar ? (
          <button onClick={() => setConfirmarEliminar(true)}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
            Eliminar devocional
          </button>
        ) : (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-3">
            <p className="text-sm font-semibold text-red-700">¿Seguro que quieres eliminar este devocional?</p>
            <p className="text-xs text-red-500">Esta acción también eliminará todos los reportes asociados. No se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmarEliminar(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={eliminar} disabled={eliminando}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600">
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
