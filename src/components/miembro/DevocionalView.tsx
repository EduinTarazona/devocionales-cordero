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

// Íconos y colores por tipo de devocional
const TIPOS = [
  {
    key: 'familiar',
    label: 'Familiar',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    key: 'grupal',
    label: 'Grupal',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'empresarial',
    label: 'Empresarial',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="12.01" strokeWidth="3" />
      </svg>
    ),
  },
]

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
      <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
        <div className="max-w-xl mx-auto px-5 py-8 pb-16">

          {/* Tres tipos de devocional */}
          <div className="flex gap-3 mb-7">
            {TIPOS.map(t => {
              const activo = devocional.tipo === t.key
              return (
                <div
                  key={t.key}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                    activo
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  <span className={activo ? 'text-white' : 'text-gray-300'}>
                    {t.icon}
                  </span>
                  <span className={`text-[11px] font-bold tracking-wide ${activo ? 'text-white' : 'text-gray-400'}`}>
                    {t.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Cabecera: semana + PDF */}
          <div className="flex items-center justify-between mb-6">
            <div>
              {devocional.semana && (
                <p className="text-[11px] text-gray-500">Semana {devocional.semana}</p>
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

          {/* Título */}
          <h1 className="text-[28px] md:text-[34px] font-extrabold text-gray-900 leading-tight mb-8">
            {devocional.titulo}
          </h1>

          {/* Versículo */}
          {devocional.pasaje && (
            <div className="mb-8 relative">
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

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Contenido */}
          {devocional.contenido && (
            <div
              className="text-[15.5px] text-gray-800 leading-[1.95] mb-10 whitespace-pre-wrap"
              style={{ fontFamily: 'Georgia, serif', textAlign: 'justify' }}
            >
              {devocional.contenido}
            </div>
          )}

          {/* Oración */}
          {devocional.oracion && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-base">🕊️</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
              <p
                className="text-[15px] text-gray-600 leading-[2] italic whitespace-pre-wrap"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {devocional.oracion}
              </p>
            </div>
          )}

          {/* Botón reporte */}
          {reporteEnviado ? (
            <div className="rounded-2xl border-2 border-teal bg-white text-center py-7 space-y-1 shadow-sm mb-6">
              <div className="text-4xl mb-1">✅</div>
              <p className="font-bold text-teal text-base">¡Ya reportaste esta semana!</p>
              <p className="text-xs text-gray-400">Gracias por participar con tu familia</p>
            </div>
          ) : (
            <button
              onClick={() => setModalAbierto(true)}
              className="btn-primary w-full text-base py-4 rounded-2xl shadow-md mb-6"
            >
              Ya lo realizamos — Reportar
            </button>
          )}

          {/* Asesoría pastoral */}
          <div
            className="rounded-3xl overflow-hidden shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0E7773 0%, #0a5553 100%)' }}
          >
            {/* Contenido */}
            <div className="px-6 pt-6 pb-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-lg">
                  🙌
                </div>
                <div>
                  <p className="font-extrabold text-base leading-tight">¿Necesitas hablar con el pastor?</p>
                  <p className="text-white/60 text-[11px] font-medium tracking-wide uppercase mt-0.5">Asesoría pastoral</p>
                </div>
              </div>
              <p className="text-white/80 text-[13px] leading-relaxed">
                Si deseas una cita, tienes una duda espiritual o quieres oración,
                estamos aquí para acompañarte. Escríbenos con confianza.
              </p>
            </div>

            {/* Botón WhatsApp */}
            <div className="px-6 pb-6">
              <a
                href="https://wa.me/573000000000?text=Hola%2C%20quisiera%20una%20asesor%C3%ADa%20pastoral"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: '#25D366', color: '#fff' }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                Escribir al pastor por WhatsApp
              </a>
            </div>
          </div>

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
