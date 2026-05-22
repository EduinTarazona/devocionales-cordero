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
      {/* Fondo cálido para toda la página */}
      <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
        <div className="max-w-xl mx-auto px-5 py-8 pb-16">

          {/* Cabecera: semana + tipo + PDF */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-primary/60">
                {tipoLabel}
              </p>
              {devocional.semana && (
                <p className="text-[11px] text-gray-500 mt-0.5">Semana {devocional.semana}</p>
              )}
            </div>
            <button
              onClick={() => window.open('/devocional/pdf', '_blank')}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary/70 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar PDF
            </button>
          </div>

          {/* Título principal */}
          <h1 className="text-[28px] md:text-[34px] font-extrabold text-gray-900 leading-tight mb-8">
            {devocional.titulo}
          </h1>

          {/* Versículo — tratamiento de cita literaria */}
          {devocional.pasaje && (
            <div className="mb-8 relative">
              {/* Comilla decorativa grande */}
              <span className="absolute -top-4 -left-2 text-[80px] leading-none text-primary/15 font-serif select-none">
                &ldquo;
              </span>
              <blockquote className="relative pl-5 border-l-[3px] border-primary/40">
                <p className="text-[17px] md:text-[19px] font-medium italic text-gray-800 leading-[1.8]">
                  {devocional.pasaje}
                </p>
                {devocional.referencia && (
                  <footer className="mt-3 text-sm font-bold text-primary not-italic tracking-wide">
                    {devocional.referencia}
                  </footer>
                )}
              </blockquote>
            </div>
          )}

          {!devocional.pasaje && devocional.referencia && (
            <p className="text-sm font-bold text-primary mb-6 tracking-wide">{devocional.referencia}</p>
          )}

          {/* Divisor elegante */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Contenido — fluye como texto corrido */}
          {devocional.contenido && (
            <div
              className="text-[15.5px] text-gray-800 leading-[1.95] mb-10 whitespace-pre-wrap"
              style={{ fontFamily: 'Georgia, serif', textAlign: 'justify' }}
            >
              {devocional.contenido}
            </div>
          )}

          {/* Oración — integrada al flujo, no como sección aparte */}
          {devocional.oracion && (
            <div
              className="rounded-2xl px-6 py-6 mb-10"
              style={{ background: 'rgba(14,119,115,0.08)', borderLeft: '3px solid #0E7773' }}
            >
              <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">
                🙏 Oremos juntos
              </p>
              <p
                className="text-[15px] text-gray-700 leading-[1.9] italic whitespace-pre-wrap"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {devocional.oracion}
              </p>
            </div>
          )}

          {/* Botón reporte */}
          {reporteEnviado ? (
            <div className="rounded-2xl border-2 border-teal bg-white text-center py-7 space-y-1 shadow-sm">
              <div className="text-4xl mb-1">✅</div>
              <p className="font-bold text-teal text-base">¡Ya reportaste esta semana!</p>
              <p className="text-xs text-gray-400">Gracias por participar con tu familia</p>
            </div>
          ) : (
            <button
              onClick={() => setModalAbierto(true)}
              className="btn-primary w-full text-base py-4 rounded-2xl shadow-md"
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
