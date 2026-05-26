'use client'
import NuevoDevocionalForm from './NuevoDevocionalForm'
import EditarDevocionalForm from './EditarDevocionalForm'
import ReportesLista from './ReportesLista'
import UsuariosLista from './UsuariosLista'
import AppShell from '../AppShell'
import { displayRol } from '@/lib/roles'

type MiembroPendiente = { id: string; nombre: string | null; email: string | null }
type Vista = 'resumen' | 'nuevo' | 'editar' | 'reportes' | 'usuarios'

type Props = {
  user: { id: string; nombre?: string; email: string }
  devocionalActivo: any
  reportesSemana: any[]
  totalMiembros: number
  ofrendaMes: number
  noReportaron: MiembroPendiente[]
  rol: string
  vista: Vista
}

const TITULO_VISTA: Record<Vista, string> = {
  resumen: 'Resumen',
  nuevo: 'Publicar devocional',
  editar: 'Editar devocional',
  reportes: 'Reportes',
  usuarios: 'Usuarios',
}

export default function AdminDashboard({ user, devocionalActivo, reportesSemana, totalMiembros, ofrendaMes, noReportaron, rol, vista }: Props) {
  const totalPersonas = reportesSemana.reduce((s, r) => s + (r.personas_participaron ?? 0), 0)
  const totalOfrenda = reportesSemana.filter(r => r.hubo_ofrenda).reduce((s, r) => s + (r.monto_ofrenda ?? 0), 0)
  const reportaron = reportesSemana.length

  const rolBadge = (
    <span className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full font-medium">{displayRol(rol)}</span>
  )

  return (
    <AppShell
      user={user}
      rol={rol}
      currentPath="/admin"
      title={TITULO_VISTA[vista]}
      subtitle="Panel administrativo"
      actions={rolBadge}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">

        {vista === 'resumen' && (
          <div className="space-y-5">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Reportaron esta semana', value: reportaron, color: 'text-primary' },
                { label: 'Personas alcanzadas', value: totalPersonas, color: 'text-teal' },
                { label: 'Total miembros', value: totalMiembros, color: 'text-gray-700' },
                { label: 'No reportaron', value: Math.max(0, totalMiembros - reportaron), color: 'text-orange-500' },
              ].map(stat => (
                <div key={stat.label} className="card text-center">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {(totalOfrenda > 0 || ofrendaMes > 0) && (
              <div className="card border-teal border space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Ofrenda esta semana</p>
                  <p className="text-2xl font-bold text-teal">${totalOfrenda.toLocaleString()}</p>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-sm text-gray-500">Ofrenda este mes</p>
                  <p className="text-xl font-semibold text-teal">${ofrendaMes.toLocaleString()}</p>
                </div>
              </div>
            )}

            {devocionalActivo && noReportaron.length > 0 && (
              <div className="card space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">No reportaron aun</p>
                  <span className="badge bg-orange-100 text-orange-600">{noReportaron.length}</span>
                </div>
                <p className="text-xs text-gray-400">Miembros activos que no han reportado el devocional actual.</p>
                <div className="divide-y divide-gray-50 -mx-1">
                  {noReportaron.slice(0, 10).map(m => (
                    <div key={m.id} className="py-2 px-1 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{m.nombre ?? m.email}</p>
                        {m.nombre && <p className="text-xs text-gray-400">{m.email}</p>}
                      </div>
                      {m.email && (
                        <a
                          href={`mailto:${m.email}?subject=${encodeURIComponent('Devocional de la semana')}`}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          Contactar
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                {noReportaron.length > 10 && (
                  <p className="text-xs text-gray-400 text-center pt-1">
                    Y {noReportaron.length - 10} mas...
                  </p>
                )}
              </div>
            )}

            {devocionalActivo ? (
              <div className="card space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Devocional activo</p>
                    <p className="font-semibold text-gray-900">{devocionalActivo.titulo}</p>
                    {devocionalActivo.semana && (
                      <p className="text-xs text-gray-400 mt-0.5">Semana {devocionalActivo.semana}</p>
                    )}
                    {devocionalActivo.pasaje && (
                      <p className="text-sm text-gray-500 italic mt-1 line-clamp-2">{devocionalActivo.pasaje}</p>
                    )}
                  </div>
                  <a
                    href="/admin?vista=editar"
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-light px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </a>
                </div>
              </div>
            ) : (
              <div className="card border-dashed border-gray-300 text-center space-y-2">
                <p className="text-sm text-gray-500">No hay devocional activo esta semana</p>
                <a href="/admin?vista=nuevo" className="btn-primary text-sm px-4 py-2 inline-block">
                  Publicar ahora
                </a>
              </div>
            )}

            {reportesSemana.length > 0 && (
              <div className="card space-y-3">
                <p className="text-sm font-semibold text-gray-700">Ultimos reportes</p>
                {reportesSemana.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{r.perfiles?.nombre ?? r.perfiles?.email}</p>
                      <p className="text-xs text-gray-400">{r.personas_participaron} personas</p>
                    </div>
                    <div className="text-right">
                      {r.hubo_ofrenda && <span className="badge bg-teal-light text-teal">Ofrenda</span>}
                    </div>
                  </div>
                ))}
                {reportesSemana.length > 5 && (
                  <a href="/admin?vista=reportes" className="text-sm text-primary font-medium block">
                    Ver todos ({reportesSemana.length})
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {vista === 'nuevo' && <NuevoDevocionalForm onPublicado={() => window.location.assign('/admin')} />}
        {vista === 'editar' && devocionalActivo && (
          <EditarDevocionalForm
            devocional={devocionalActivo}
            onGuardado={() => window.location.assign('/admin')}
          />
        )}
        {vista === 'editar' && !devocionalActivo && (
          <div className="card text-center space-y-3">
            <p className="text-gray-500 text-sm">No hay devocional activo para editar.</p>
            <a href="/admin?vista=nuevo" className="btn-primary text-sm px-4 py-2 inline-block">Publicar uno nuevo</a>
          </div>
        )}
        {vista === 'reportes' && <ReportesLista reportes={reportesSemana} totalMiembros={totalMiembros} />}
        {vista === 'usuarios' && <UsuariosLista currentUserId={user.id} />}

      </div>
    </AppShell>
  )
}
