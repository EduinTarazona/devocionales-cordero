'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { displayRol, ROL_OPTIONS, esAdmin } from '@/lib/roles'

type Usuario = {
  id: string
  nombre: string | null
  email: string | null
  rol: string
  activo: boolean
  created_at: string
  red_asignada: string | null
}

export default function UsuariosLista({ currentUserId }: { currentUserId: string }) {
  const supabase = createClient()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('')
  const [guardandoId, setGuardandoId] = useState<string | null>(null)

  async function cargar() {
    setCargando(true)
    setError('')
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre, email, rol, activo, created_at, red_asignada')
      .order('created_at', { ascending: false })
    setCargando(false)
    if (error) { setError('No se pudieron cargar los usuarios.'); return }
    setUsuarios(data ?? [])
  }

  useEffect(() => { cargar() }, [])

  async function cambiarRol(id: string, rol: string) {
    setGuardandoId(id)
    const { error } = await supabase.from('perfiles').update({ rol }).eq('id', id)
    setGuardandoId(null)
    if (error) { setError(`No se pudo actualizar el rol: ${error.message}`); return }
    setUsuarios(us => us.map(u => u.id === id ? { ...u, rol } : u))
  }

  async function cambiarRed(id: string, red_asignada: string) {
    setGuardandoId(id)
    const { error } = await supabase.from('perfiles').update({ red_asignada: red_asignada || null }).eq('id', id)
    setGuardandoId(null)
    if (error) { setError(`No se pudo actualizar la red: ${error.message}`); return }
    setUsuarios(us => us.map(u => u.id === id ? { ...u, red_asignada: red_asignada || null } : u))
  }

  async function toggleActivo(id: string, activo: boolean) {
    setGuardandoId(id)
    const { error } = await supabase.from('perfiles').update({ activo: !activo }).eq('id', id)
    setGuardandoId(null)
    if (error) { setError(`No se pudo actualizar: ${error.message}`); return }
    setUsuarios(us => us.map(u => u.id === id ? { ...u, activo: !activo } : u))
  }

  const filtrados = usuarios.filter(u => {
    if (!filtro) return true
    const q = filtro.toLowerCase()
    return (u.nombre?.toLowerCase().includes(q) ?? false) || (u.email?.toLowerCase().includes(q) ?? false)
  })

  const stats = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.activo).length,
    pastores: usuarios.filter(u => esAdmin(u.rol)).length,
    miembros: usuarios.filter(u => u.rol === 'miembro').length,
  }

  function badgeColor(rol: string) {
    if (['pastor_general', 'plan_de_vida', 'pastor', 'admin'].includes(rol))
      return 'bg-primary-light text-primary'
    if (rol === 'pastor_supervisor')
      return 'bg-blue-100 text-blue-700'
    if (rol === 'pastor_red')
      return 'bg-orange-100 text-orange-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-5">

      <div className="card">
        <h2 className="font-bold text-gray-900">Usuarios de la congregación</h2>
        <div className="grid grid-cols-4 gap-2 text-center pt-3">
          <div><p className="text-xl font-bold text-primary">{stats.total}</p><p className="text-xs text-gray-400">Total</p></div>
          <div><p className="text-xl font-bold text-teal">{stats.activos}</p><p className="text-xs text-gray-400">Activos</p></div>
          <div><p className="text-xl font-bold text-orange-500">{stats.miembros}</p><p className="text-xs text-gray-400">Miembros</p></div>
          <div><p className="text-xl font-bold text-gray-700">{stats.pastores}</p><p className="text-xs text-gray-400">Pastores</p></div>
        </div>
      </div>

      <input
        type="search"
        placeholder="Buscar por nombre o email..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        className="input"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {cargando ? (
        <p className="text-center text-sm text-gray-400 py-8">Cargando...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">Sin resultados.</p>
      ) : (
        <div className="space-y-3">
          {filtrados.map(u => {
            const esYo = u.id === currentUserId
            const guardando = guardandoId === u.id
            return (
              <div key={u.id} className={`card space-y-2 ${!u.activo ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {u.nombre ?? u.email ?? 'Sin nombre'}
                      {esYo && <span className="ml-2 text-xs text-gray-400">(tú)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className={`badge ${badgeColor(u.rol)}`}>{displayRol(u.rol)}</span>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {/* Selector de rol */}
                  <select
                    value={u.rol}
                    onChange={e => cambiarRol(u.id, e.target.value)}
                    disabled={guardando || esYo}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
                  >
                    {!ROL_OPTIONS.find(o => o.value === u.rol) && (
                      <option value={u.rol}>{displayRol(u.rol)}</option>
                    )}
                    {ROL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  {/* Red asignada — visible para todos */}
                  <input
                    type="text"
                    placeholder="Red (ej: 1)"
                    defaultValue={u.red_asignada ?? ''}
                    onBlur={e => cambiarRed(u.id, e.target.value)}
                    disabled={guardando || esYo}
                    title="Número de red al que pertenece"
                    className="text-xs border border-orange-200 rounded-lg px-2 py-1.5 bg-white w-24 disabled:opacity-50 focus:outline-none focus:border-orange-400"
                  />

                  <button
                    onClick={() => toggleActivo(u.id, u.activo)}
                    disabled={guardando || esYo}
                    className={`text-xs px-3 py-1.5 rounded-lg border disabled:opacity-50 ${
                      u.activo
                        ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                        : 'border-teal text-teal hover:bg-teal/5'
                    }`}
                  >
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        No puedes cambiar tu propio rol ni desactivar tu cuenta.
      </p>
    </div>
  )
}
