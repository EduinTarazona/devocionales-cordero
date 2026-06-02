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

const TIPOS = [
  {
    key: 'familiar', label: 'Familiar',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    key: 'grupal', label: 'Grupal',
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
    key: 'empresarial', label: 'Empresarial',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="12.01" strokeWidth="3" />
      </svg>
    ),
  },
]

const iconoBiblia = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const iconoIdea = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const iconoManos = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M6 14v0a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2.5" />
  </svg>
)

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
            <p className="text-sm text-gray-500">El pastor aún no ha publicado el devocional. Vuelve pronto.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell user={user} rol={rol} currentPath="/devocional" title="Devocional" subtitle="Esta semana">
      <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
        <div className="max-w-xl mx-auto px-5 py-8 pb-16">

          {/* Tipos */}
          <div className="flex gap-3 mb-7">
            {TIPOS.map(t => {
              const activo = devocional.tipo === t.key
              return (
                <div key={t.key}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                    activo ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                  <span className={activo ? 'text-white' : 'text-gray-300'}>{t.icon}</span>
                  <span className={`text-[11px] font-bold tracking-wide ${activo ? 'text-white' : 'text-gray-400'}`}>{t.label}</span>
                </div>
              )
            })}
          </div>

          {/* Encabezado: serie + semana + PDF */}
          <div className="flex items-start justify-between mb-4">
            <div>
              {devocional.serie && (
                <p className="text-[11px] font-semibold text-gray-500">Serie: {devocional.serie}</p>
              )}
              {devocional.semana && (
                <p className="text-[11px] text-gray-400">Semana {devocional.semana}</p>
              )}
            </div>
            <button
              onClick={() => window.open('/devocional/pdf', '_blank')}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary/70 hover:text-primary transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar PDF
            </button>
          </div>

          {/* Título en recuadro azul */}
          <div className="rounded-2xl border-2 mb-8 px-5 py-4 text-center bg-white" style={{ borderColor: '#3B3B8E' }}>
            <h1 className="text-[26px] md:text-[30px] font-extrabold leading-tight" style={{ color: '#3B3B8E' }}>
              {devocional.titulo}
            </h1>
          </div>

          {/* A) Leamos Juntos */}
          <SeccionTitulo emoji="📖" letra="A)" titulo="Leamos Juntos" color="#3B3B8E" />

          {devocional.pasaje && (
            <div className="mb-5 relative">
              <span className="absolute -top-4 -left-2 text-[80px] leading-none font-serif select-none" style={{ color: 'rgba(59,59,142,0.12)' }}>
                &ldquo;
              </span>
              <blockquote className="relative pl-5 border-l-[3px]" style={{ borderColor: 'rgba(59,59,142,0.4)' }}>
                <p className="text-[16px] md:text-[18px] font-bold text-center text-gray-800 leading-[1.8]" style={{ fontFamily: 'Georgia, serif' }}>
                  {devocional.pasaje}
                </p>
                {devocional.referencia && (
                  <footer className="mt-3 text-sm font-bold text-center not-italic tracking-wide" style={{ color: '#3B3B8E' }}>
                    {devocional.referencia}
                  </footer>
                )}
              </blockquote>
            </div>
          )}

          {devocional.introduccion && (
            <p className="text-[15px] text-gray-700 leading-[1.9] mb-6 whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
              {devocional.introduccion}
            </p>
          )}

          <Divisor />

          {/* B) Aprendemos en Familia */}
          <SeccionTitulo emoji="👨‍👩‍👧‍👦" letra="B)" titulo="Aprendemos en Familia la verdad de Dios" color="#3B3B8E" />

          {devocional.contenido && (
            <div className="mb-5">
              {devocional.imagen_url && (
                <img
                  src={devocional.imagen_url}
                  alt="Ilustración del devocional"
                  className="rounded-2xl shadow-md object-cover"
                  style={{ float: 'right', width: 200, height: 200, marginLeft: 18, marginBottom: 10 }}
                />
              )}
              {devocional.contenido.split('\n').map((linea: string, i: number) =>
                linea.trim() ? (
                  <p key={i} className="text-[15px] text-gray-800 leading-[1.95] mb-[0.6rem]"
                    style={{ fontFamily: 'Georgia, serif', textAlign: 'justify' }}>
                    {linea}
                  </p>
                ) : (
                  <div key={i} className="mb-1" />
                )
              )}
              <div style={{ clear: 'both' }} />
            </div>
          )}

          {/* Intercambiemos Ideas */}
          {devocional.intercambiemos_ideas && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💡</span>
                <h3 className="text-base font-bold" style={{ color: '#F7941D' }}>Intercambiemos ideas:</h3>
              </div>
              <img src="/Intercambiemos_ideas.png" alt="Intercambiemos ideas" className="w-full rounded-2xl mb-3" style={{ maxHeight: 200, objectFit: 'contain' }} />
              <div className="text-[15px] text-gray-700 leading-[1.9] whitespace-pre-wrap pl-1">
                {devocional.intercambiemos_ideas}
              </div>
            </div>
          )}

          <Divisor />

          {/* C) Tomamos tiempo para agradecer y orar */}
          <SeccionTitulo emoji="🙏" letra="C)" titulo="Tomamos tiempo para agradecer y orar" color="#3B3B8E" />

          {devocional.oracion && (
            <p className="text-[15px] text-gray-600 leading-[2] italic whitespace-pre-wrap mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              {devocional.oracion}
            </p>
          )}

          {/* Cierre */}
          <p className="text-center font-extrabold text-base mb-8" style={{ color: '#F7941D' }}>
            ¡Yo y mi Casa Serviremos al Señor!
          </p>

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
          <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: 'linear-gradient(135deg, #3B3B8E 0%, #2A2A6B 100%)' }}>
            <div className="px-6 pt-6 pb-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-lg">🙌</div>
                <div>
                  <p className="font-extrabold text-base leading-tight">¿Necesitas hablar con el pastor?</p>
                  <p className="text-white/60 text-[11px] font-medium tracking-wide uppercase mt-0.5">Asesoría pastoral</p>
                </div>
              </div>
              <p className="text-white/80 text-[13px] leading-relaxed">
                Si deseas una cita, tienes una duda espiritual o quieres oración, estamos aquí para acompañarte.
              </p>
            </div>
            <div className="px-6 pb-6">
              <a
                href="https://wa.me/573000000000"
                target="_blank" rel="noopener noreferrer"
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

function SeccionTitulo({ emoji, letra, titulo, color }: { emoji: string; letra: string; titulo: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-2xl">{emoji}</span>
      <h2 className="text-xl font-extrabold" style={{ color }}>{letra} {titulo}</h2>
    </div>
  )
}

function Divisor() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-px bg-gray-300" />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(59,59,142,0.35)' }} />
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  )
}
