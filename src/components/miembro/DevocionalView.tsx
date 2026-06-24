'use client'
import { useState } from 'react'
import ReporteModal from './ReporteModal'
import AppShell from '../AppShell'

type MiReporte = {
  id: string
  adultos: number | null
  ninos: number | null
  hubo_ofrenda: boolean | null
  monto_ofrenda: number | null
  moneda_ofrenda: string | null
  tipo: string | null
  nombre_grupo: string | null
  nombre_empresa: string | null
} | null

type Props = {
  user: { id: string; email: string; nombre?: string }
  rol: string
  devocional: any
  reportesPorTipo: Record<string, MiReporte>
  previewRol?: string | null
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

export default function DevocionalView({ user, rol, devocional, reportesPorTipo, previewRol }: Props) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'familiar' | 'grupal' | 'empresarial'>('familiar')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [reportes, setReportes] = useState<Record<string, MiReporte>>(reportesPorTipo)

  const reporteActual = reportes[tipoSeleccionado] ?? null
  const yaReporto = !!reporteActual

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
      {previewRol && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-800 font-medium">
            Vista previa como: <span className="font-bold">Miembro</span>
            <span className="font-normal text-amber-600 ml-2">— Esto es lo que ve un miembro</span>
          </p>
          <a href="/admin" className="text-xs text-amber-700 underline hover:text-amber-900">Salir</a>
        </div>
      )}
      <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
        <div className="max-w-xl mx-auto px-5 py-8 pb-16">

          {/* Tipos — ahora clickables */}
          <div className="flex gap-3 mb-7">
            {TIPOS.map(t => {
              const activo = tipoSeleccionado === t.key
              const reportado = !!reportes[t.key]
              return (
                <button
                  key={t.key}
                  onClick={() => setTipoSeleccionado(t.key as any)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all relative ${
                    activo ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {reportado && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400" />
                  )}
                  <span className={activo ? 'text-white' : 'text-gray-300'}>{t.icon}</span>
                  <span className={`text-[11px] font-bold tracking-wide ${activo ? 'text-white' : 'text-gray-400'}`}>{t.label}</span>
                </button>
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
                  style={{ float: 'right', width: 210, height: 210, marginLeft: 18, marginBottom: 8 }}
                />
              )}
              {(() => {
                const lineas = devocional.contenido.split('\n')
                const parrafos: string[] = []
                let actual: string[] = []
                for (const linea of lineas) {
                  if (linea.trim()) {
                    actual.push(linea.trim())
                  } else if (actual.length > 0) {
                    parrafos.push(actual.join(' '))
                    actual = []
                  }
                }
                if (actual.length > 0) parrafos.push(actual.join(' '))
                return parrafos.map((p, i) => (
                  <p key={i} style={{ fontFamily: 'Georgia, serif', textAlign: 'justify', lineHeight: '1.65', fontSize: 15, color: '#1f2937', marginBottom: 8 }}>
                    {p}
                  </p>
                ))
              })()}
              <div style={{ clear: 'both' }} />
            </div>
          )}

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

          <p className="text-center font-extrabold text-base mb-8" style={{ color: '#F7941D' }}>
            ¡Yo y mi Casa Serviremos al Señor!
          </p>

          {/* Botón / estado de reporte por tipo */}
          {yaReporto ? (
            <div className="rounded-2xl border-2 border-teal bg-white text-center py-6 space-y-2 shadow-sm mb-6 px-5">
              <div className="text-4xl mb-1">✅</div>
              <p className="font-bold text-teal text-base">
                ¡Ya reportaste el devocional {tipoSeleccionado}!
              </p>
              <p className="text-xs text-gray-400">Gracias por participar</p>
              {reporteActual && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm text-gray-600">
                  {tipoSeleccionado === 'familiar' && (
                    <>
                      {(reporteActual.adultos != null || reporteActual.ninos != null) && (
                        <p>👨‍👩‍👧 <span className="font-semibold">{(reporteActual.adultos ?? 0) + (reporteActual.ninos ?? 0)}</span> personas · {reporteActual.adultos ?? 0} adultos · {reporteActual.ninos ?? 0} niños</p>
                      )}
                    </>
                  )}
                  {tipoSeleccionado === 'grupal' && reporteActual.nombre_grupo && (
                    <p>👥 Grupo: <span className="font-semibold">{reporteActual.nombre_grupo}</span> · {(reporteActual.adultos ?? 0) + (reporteActual.ninos ?? 0)} personas</p>
                  )}
                  {tipoSeleccionado === 'empresarial' && reporteActual.nombre_empresa && (
                    <p>🏢 Empresa: <span className="font-semibold">{reporteActual.nombre_empresa}</span> · {(reporteActual.adultos ?? 0) + (reporteActual.ninos ?? 0)} personas</p>
                  )}
                  {reporteActual.hubo_ofrenda ? (
                    <p>💛 Ofrenda: <span className="font-semibold text-orange-500">
                      {reporteActual.monto_ofrenda
                        ? `${reporteActual.moneda_ofrenda === 'Bs' ? 'Bs.' : '$'}${reporteActual.monto_ofrenda.toLocaleString()} ${reporteActual.moneda_ofrenda ?? 'USD'}`
                        : 'Sí'}
                    </span></p>
                  ) : (
                    <p className="text-gray-400 text-xs">Sin ofrenda registrada</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setModalAbierto(true)}
              className="btn-primary w-full text-base py-4 rounded-2xl shadow-md mb-6"
            >
              Ya lo realizamos — Reportar {tipoSeleccionado}
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
                href="https://mail.google.com/mail/?view=cm&to=casasdevidaccmgsancristobal@gmail.com"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: '#F7941D', color: '#fff' }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Escribir al pastor por correo
              </a>
            </div>
          </div>

        </div>
      </div>

      {modalAbierto && (
        <ReporteModal
          devocionalId={devocional.id}
          userId={user.id}
          tipo={tipoSeleccionado}
          onClose={() => setModalAbierto(false)}
          onSuccess={(datos) => {
            setReportes(prev => ({ ...prev, [tipoSeleccionado]: { id: '', tipo: tipoSeleccionado, ...datos } as any }))
            setModalAbierto(false)
          }}
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
