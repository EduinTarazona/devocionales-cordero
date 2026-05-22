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

  const tipoLabel = devocional.tipo === 'familiar' ? 'Devocional Familiar'
    : devocional.tipo === 'grupal' ? 'Devocional Grupal'
    : 'Devocional Empresarial'

  return (
    <AppShell user={user} rol={rol} currentPath="/devocional" title="Devocional" subtitle="Esta semana">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-0">

        {/* HERO — semana + tipo + título */}
        <div className="rounded-t-2xl bg-primary px-6 pt-6 pb-8 text-white relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)' }} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-widest uppercase opacity-80">
                {tipoLabel}
              </span>
              <button
                onClick={() => window.open('/devocional/pdf', '_blank')}
                className="flex items-center gap-1 text-xs font-medium opacity-80 hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                PDF
              </button>
            </div>

            {devocional.semana && (
              <p className="text-xs font-medium opacity-70 mb-1">Semana {devocional.semana}</p>
            )}

            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4">
              {devocional.titulo}
            </h1>

            {/* Pasaje destacado */}
            {devocional.pasaje && (
              <div className="border-l-4 border-white/40 pl-4 mt-4">
                <p className="text-sm md:text-base italic leading-relaxed opacity-95">
                  &ldquo;{devocional.pasaje}&rdquo;
                </p>
                {devocional.referencia && (
                  <p className="text-xs font-semibold opacity-70 mt-2 tracking-wide">
                    — {devocional.referencia}
                  </p>
                )}
              </div>
            )}
            {!devocional.pasaje && devocional.referencia && (
              <p className="text-xs font-semibold opacity-70 mt-2 tracking-wide">
                {devocional.referencia}
              </p>
            )}
          </div>
        </div>

        {/* Separador decorativo */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-teal to-primary opacity-60 rounded-none" />

        {/* CONTENIDO */}
        {devocional.contenido && (
          <div className="bg-white px-6 py-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-5 rounded-full bg-primary inline-block" />
              <h2 className="text-xs font-bold tracking-widest uppercase text-primary">Mensaje</h2>
            </div>
            <div className="text-[15px] text-gray-800 leading-[1.9] whitespace-pre-wrap">
              {devocional.contenido}
            </div>
          </div>
        )}

        {/* ORACIÓN */}
        {devocional.oracion && (
          <div className="bg-[#F0FAF9] px-6 py-7 shadow-sm rounded-b-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🙏</span>
              <h2 className="text-xs font-bold tracking-widest uppercase text-primary">Oremos juntos</h2>
            </div>
            <p className="text-[14.5px] text-gray-700 leading-[1.9] italic whitespace-pre-wrap">
              {devocional.oracion}
            </p>
          </div>
        )}

        {/* BOTÓN REPORTE */}
        <div className="pt-5 pb-8">
          {reporteEnviado ? (
            <div className="rounded-2xl border-2 border-teal bg-teal/5 text-center py-6 space-y-1">
              <div className="text-3xl">✅</div>
              <p className="font-bold text-teal">¡Ya reportaste esta semana!</p>
              <p className="text-xs text-gray-500">Gracias por participar con tu familia</p>
            </div>
          ) : (
            <button
              onClick={() => setModalAbierto(true)}
              className="btn-primary w-full text-base py-4 rounded-2xl shadow-lg"
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
