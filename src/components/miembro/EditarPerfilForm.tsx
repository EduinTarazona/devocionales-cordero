'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppShell from '../AppShell'

type Props = {
  user: { id: string; email: string; nombre?: string }
  rol: string
  perfil: {
    nombre: string | null
    apellidos_familia: string | null
    adultos: number | null
    ninos: number | null
    direccion: string | null
    telefono: string | null
  } | null
}

export default function EditarPerfilForm({ user, rol, perfil }: Props) {
  const supabase = createClient()
  const [form, setForm] = useState({
    nombre: perfil?.nombre ?? '',
    apellidos_familia: perfil?.apellidos_familia ?? '',
    adultos: String(perfil?.adultos ?? ''),
    ninos: String(perfil?.ninos ?? ''),
    direccion: perfil?.direccion ?? '',
    telefono: perfil?.telefono ?? '',
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [guardado, setGuardado] = useState(false)

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setGuardado(false)

    if (!form.nombre.trim() || !form.apellidos_familia.trim() || !form.direccion.trim()) {
      setError('Por favor completa los campos obligatorios.')
      return
    }

    setCargando(true)
    const { error: err } = await supabase
      .from('perfiles')
      .update({
        nombre: form.nombre.trim(),
        apellidos_familia: form.apellidos_familia.trim(),
        adultos: parseInt(form.adultos) || 0,
        ninos: parseInt(form.ninos) || 0,
        direccion: form.direccion.trim(),
        telefono: form.telefono.trim() || null,
      })
      .eq('id', user.id)

    setCargando(false)
    if (err) { setError('Error al guardar. Intenta de nuevo.'); return }
    setGuardado(true)
  }

  const rolesAdmin = ['admin', 'pastor', 'pastor_general', 'plan_de_vida', 'pastor_supervisor', 'pastor_red']
  const esAdmin = rolesAdmin.includes(rol)

  return (
    <AppShell
      user={user}
      rol={rol}
      currentPath="/perfil"
      title="Mi perfil"
      subtitle="Datos de tu Casa de Vida"
    >
      <div className="max-w-lg mx-auto px-4 py-8">
        <form onSubmit={guardar} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6 space-y-4">

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
              Datos del guía de familia
            </p>
            <div className="space-y-3">
              <Campo label="Nombre y apellido del guía *" name="nombre" placeholder="Ej: María Gabriela Chacón" value={form.nombre} onChange={handle} />
              <Campo label="Apellidos de la familia *" name="apellidos_familia" placeholder="Ej: Chacón Márquez" value={form.apellidos_familia} onChange={handle} />
              <Campo label="Teléfono" name="telefono" placeholder="Ej: 0414-1234567" value={form.telefono} onChange={handle} type="tel" />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
              Integrantes del hogar
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Adultos" name="adultos" placeholder="0" type="number" value={form.adultos} onChange={handle} />
              <Campo label="Niños" name="ninos" placeholder="0" type="number" value={form.ninos} onChange={handle} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
              Ubicación
            </p>
            <Campo label="Dirección *" name="direccion" placeholder="Ej: Urb. Los Pinos, Calle 5, Casa 12" value={form.direccion} onChange={handle} />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          {guardado && (
            <p className="text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2 font-medium">
              ✓ Perfil actualizado correctamente
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <a
              href={esAdmin ? '/admin' : '/devocional'}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 text-center hover:bg-gray-50 transition-colors"
            >
              Volver
            </a>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg, #3B3B8E, #F7941D)' }}
            >
              {cargando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

function Campo({ label, name, placeholder, value, onChange, type = 'text' }: {
  label: string; name: string; placeholder: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type} name={name} placeholder={placeholder} value={value} onChange={onChange}
        min={type === 'number' ? '0' : undefined}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />
    </div>
  )
}
