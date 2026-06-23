'use client'
import { useState } from 'react'
import AppShell from '../AppShell'

type Casa = {
  id: string
  nombre: string | null
  apellidos_familia: string | null
  direccion: string | null
  telefono: string | null
  adultos: number | null
  ninos: number | null
  red_asignada: string | null
  email: string | null
}

type Props = {
  user: { id: string; nombre?: string; email: string }
  rol: string
  casas: Casa[]
}

const PRIMARY = '#3B3B8E'

export default function DirectorioView({ user, rol, casas }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [redFiltro, setRedFiltro] = useState('')

  const redes = Array.from(new Set(casas.map(c => c.red_asignada).filter(Boolean))).sort()

  const casasFiltradas = casas.filter(c => {
    const texto = busqueda.toLowerCase()
    const coincideTexto = !busqueda ||
      (c.nombre ?? '').toLowerCase().includes(texto) ||
      (c.apellidos_familia ?? '').toLowerCase().includes(texto) ||
      (c.direccion ?? '').toLowerCase().includes(texto)
    const coincideRed = !redFiltro || c.red_asignada === redFiltro
    return coincideTexto && coincideRed
  })

  const totalAdultos = casas.reduce((s, c) => s + (c.adultos ?? 0), 0)
  const totalNinos = casas.reduce((s, c) => s + (c.ninos ?? 0), 0)
  const totalPersonas = totalAdultos + totalNinos

  return (
    <AppShell
      user={user}
      rol={rol}
      currentPath="/directorio"
      title="Directorio"
      subtitle="Casas de Vida"
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-4">

        {/* Resumen */}
        <div className="rounded-2xl px-4 py-4" style={{ background: '#EBEBF8' }}>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: PRIMARY }}>
            Resumen de la congregación
          </p>
          <p className="text-sm text-gray-700">
            Hay <strong>{casas.length} Casas de Vida</strong> registradas con un total de{' '}
            <strong>{totalPersonas} personas</strong> — {totalAdultos} adultos y {totalNinos} niños.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center py-4">
            <p className="text-3xl font-extrabold" style={{ color: PRIMARY }}>{casas.length}</p>
            <p className="text-xs text-gray-500 mt-1">Casas de Vida</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-extrabold" style={{ color: '#F7941D' }}>{totalAdultos}</p>
            <p className="text-xs text-gray-500 mt-1">Adultos</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-extrabold" style={{ color: '#F7941D' }}>{totalNinos}</p>
            <p className="text-xs text-gray-500 mt-1">Niños</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {redes.length > 0 && (
            <select
              value={redFiltro}
              onChange={e => setRedFiltro(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Todas las redes</option>
              {redes.map(r => (
                <option key={r} value={r!}>Red {r}</option>
              ))}
            </select>
          )}
        </div>

        {/* Lista */}
        <div className="card divide-y divide-gray-50">
          {casasFiltradas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No se encontraron resultados.</p>
          ) : (
            casasFiltradas.map(casa => (
              <div key={casa.id} className="py-3 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {casa.nombre ?? casa.email ?? 'Sin nombre'}
                      {casa.apellidos_familia && (
                        <span className="text-gray-500 font-normal"> · Familia {casa.apellidos_familia}</span>
                      )}
                    </p>
                    {casa.direccion && (
                      <p className="text-xs text-gray-500 mt-0.5">📍 {casa.direccion}</p>
                    )}
                    {casa.telefono && (
                      <p className="text-xs text-gray-500">📞 {casa.telefono}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right space-y-1">
                    <p className="text-xs font-semibold" style={{ color: PRIMARY }}>
                      {(casa.adultos ?? 0) + (casa.ninos ?? 0)} personas
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {casa.adultos ?? 0} adultos · {casa.ninos ?? 0} niños
                    </p>
                    {casa.red_asignada && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Red {casa.red_asignada}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          {casasFiltradas.length} de {casas.length} Casas de Vida
        </p>
      </div>
    </AppShell>
  )
}
