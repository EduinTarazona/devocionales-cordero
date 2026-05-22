'use client'
import { useState } from 'react'
import ReporteModal from './ReporteModal'
import AppShell from '../AppShell'

type Props = {
  user: { id: string; email: string; nombre?: string }
  rol: string
  devocional: any
  yaReporto: boolean
}

export default function DevocionalView({ user, rol, devocional, yaReporto }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [reporteEnviado, setReporteEnviado] = useState(yaReporto)

  if (!devocional) {
    return (
      <AppShell user={user} rol={rol} currentPath="/devocional" title="Devocional" subtitle="Esta semana">
        <div className="flex items-center justify-center px-4 py-16 min-h-[60vh]">
          <div className="card text-center space-y-3 max-w-sm w-full">
            <div className="text-4xl">📖</div>
            <h2 className="font-semibold text-gray-800">Sin devocional esta semana</h2>
            <p className="text-sm text-gray-500">El pastor aun no ha publicado el devocional. Vuelve pronto.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell user={user} rol={rol} currentPath="/devocional" title="Devocional" subtitle="Esta semana">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-5">

        <div className="card space-y-1">
          <div className="flex items-center justify-between">
            <span className="badge bg-primary-light text-primary">
              {devocional.tipo === 'familiar' ? 'Familiar' : devocional.tipo === 'grupal' ? 'Grupal' : 'Empresarial'}
            </span>
            <button
              onClick={() => window.open('/devocional/pdf', '_blank')}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar PDF
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-2">{devocional.titulo}</h1>
          {devocional.pasaje && (
            <p className="text-sm font-medium text-primary italic">"{devocional.pasaje}"</p>
          )}
          {devocional.referencia && (
            <p className="text-xs text-gray-400">{devocional.referencia}</p>
          )}
        </div>

        {devocional.contenido && (
          <div className="card">
            <h2 className="font-semibold text-gray-700 text-sm mb-3">Desarrollo</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {devocional.contenido}
            </div>
          </div>
        )}

        {devocional.dinamica && (
          <div className="card border-l-4 border-teal">
            <h2 className="font-semibold text-teal text-sm mb-2">Dinamica familiar</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{devocional.dinamica}</p>
          </div>
        )}

        {devocional.oracion && (
          <div className="card bg-primary-light border-0">
            <h2 className="font-semibold text-primary text-sm mb-2">Oracion</h2>
            <p className="text-sm text-gray-700 leading-relaxed italic">{devocional.oracion}</p>
          </div>
        )}

        <div className="pb-8">
          {reporteEnviado ? (
            <div className="card text-center space-y-2 border-teal border">
              <div className="text-3xl">✅</div>
              <p className="font-semibold text-teal">Ya reportaste este devocional</p>
              <p className="text-xs text-gray-500">Gracias por participar esta semana</p>
            </div>
          ) : (
            <button
              onClick={() => setModalAbierto(true)}
              className="btn-primary w-full text-base py-4"
            >
              Ya lo realizamos — Reportar
            </button>
          )}
        </div>

      </div>

      {modalAbierto && (
        <ReporteModal
          devocionalId={devocional.id}
          userId={user.id}
          onClose={() => setModalAbierto(false)}
          onSuccess={() => { setReporteEnviado(true); setModalAbierto(false) }}
        />
      )}
    </AppShell>
  )
}
