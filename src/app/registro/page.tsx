'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RegistroPage() {
  const supabase = createClient()

  const [form, setForm] = useState({
    nombre: '',
    apellidos_familia: '',
    adultos: '',
    ninos: '',
    direccion: '',
    telefono: '',
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim() || !form.apellidos_familia.trim() || !form.direccion.trim()) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }

    setCargando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { error: err } = await supabase
      .from('perfiles')
      .update({
        nombre: form.nombre.trim(),
        apellidos_familia: form.apellidos_familia.trim(),
        adultos: parseInt(form.adultos) || 0,
        ninos: parseInt(form.ninos) || 0,
        direccion: form.direccion.trim(),
        telefono: form.telefono.trim() || null,
        perfil_completo: true,
      })
      .eq('id', user.id)

    if (err) {
      setError('Ocurrió un error al guardar. Intenta de nuevo.')
      setCargando(false)
      return
    }

    window.location.href = '/devocional'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#F5F0E8' }}>
      <div className="w-full max-w-md">

        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <svg width="64" height="64" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
            <path d="M 59 17 A 30 30 0 1 0 59 59" stroke="#F7941D" strokeWidth="10" strokeLinecap="round" fill="none"/>
            <rect x="44" y="25" width="5" height="11" rx="1" fill="#3B3B8E"/>
            <polygon points="24,38 38,22 52,38" fill="#3B3B8E"/>
            <rect x="27" y="38" width="22" height="16" rx="1" fill="#3B3B8E"/>
            <rect x="29" y="40" width="6" height="5" rx="0.5" fill="white" fillOpacity="0.85"/>
            <rect x="35" y="44" width="7" height="10" rx="1" fill="white" fillOpacity="0.95"/>
          </svg>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#3B3B8E' }}>
            Bienvenido a <span style={{ color: '#F7941D' }}>Sistema Vida</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Completa tu registro para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={guardar} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6 space-y-4">

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
              Datos del guía de familia
            </p>
            <div className="space-y-3">
              <Campo
                label="Nombre y apellido del guía *"
                name="nombre"
                placeholder="Ej: María Gabriela Chacón"
                value={form.nombre}
                onChange={handle}
              />
              <Campo
                label="Apellidos de la familia *"
                name="apellidos_familia"
                placeholder="Ej: Chacón Márquez"
                value={form.apellidos_familia}
                onChange={handle}
              />
              <Campo
                label="Teléfono"
                name="telefono"
                placeholder="Ej: 0414-1234567"
                value={form.telefono}
                onChange={handle}
                type="tel"
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
              Integrantes del hogar
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Campo
                label="Adultos"
                name="adultos"
                placeholder="0"
                type="number"
                value={form.adultos}
                onChange={handle}
              />
              <Campo
                label="Niños"
                name="ninos"
                placeholder="0"
                type="number"
                value={form.ninos}
                onChange={handle}
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
              Ubicación
            </p>
            <Campo
              label="Dirección *"
              name="direccion"
              placeholder="Ej: Urb. Los Pinos, Calle 5, Casa 12"
              value={form.direccion}
              onChange={handle}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
            style={{ background: 'linear-gradient(90deg, #3B3B8E, #F7941D)' }}
          >
            {cargando ? 'Guardando...' : 'Completar registro →'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Solo se registra una vez · Tus datos son privados
        </p>
      </div>
    </div>
  )
}

function Campo({ label, name, placeholder, value, onChange, type = 'text' }: {
  label: string
  name: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={type === 'number' ? '0' : undefined}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />
    </div>
  )
}
