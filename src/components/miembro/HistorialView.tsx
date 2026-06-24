'use client'
import AppShell from '../AppShell'

const PRIMARY = '#3B3B8E'
const ORANGE  = '#F7941D'
const TEAL    = '#0D9488'

type Reporte = {
  id: string
  adultos: number | null
  ninos: number | null
  personas_participaron: number | null
  hubo_ofrenda: boolean
  monto_ofrenda: number | null
  moneda_ofrenda: string | null
  nota: string | null
  tipo: string | null
  nombre_grupo: string | null
  nombre_empresa: string | null
  created_at: string
  devocionales: {
    id: string
    titulo: string
    pasaje: string | null
    referencia: string | null
  } | null
}

type Props = {
  user: { id: string; email: string; nombre?: string }
  rol: string
  reportes: Reporte[]
}

function totalPersonas(r: Reporte) {
  if (r.adultos != null || r.ninos != null) return (r.adultos ?? 0) + (r.ninos ?? 0)
  return r.personas_participaron ?? 0
}

function simbolo(moneda: string | null) {
  return moneda === 'Bs' ? 'Bs.' : '$'
}

function tipoBadge(tipo: string | null) {
  if (tipo === 'grupal')      return { label: 'Grupal',      bg: '#FEF3E2', color: ORANGE }
  if (tipo === 'empresarial') return { label: 'Empresarial', bg: '#CCFBF1', color: TEAL   }
  return                             { label: 'Familiar',    bg: '#EBEBF8', color: PRIMARY }
}

export default function HistorialView({ user, rol, reportes }: Props) {
  const total        = reportes.reduce((s, r) => s + totalPersonas(r), 0)
  const familiares   = reportes.filter(r => !r.tipo || r.tipo === 'familiar').length
  const grupales     = reportes.filter(r => r.tipo === 'grupal').length
  const empresariales = reportes.filter(r => r.tipo === 'empresarial').length

  return (
    <AppShell user={user} rol={rol} currentPath="/historial" title="Mi historial" subtitle="Devocionales completados">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="card py-3">
            <p className="text-2xl font-bold" style={{ color: PRIMARY }}>{reportes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Reportes</p>
          </div>
          <div className="card py-3">
            <p className="text-2xl font-bold" style={{ color: TEAL }}>{total}</p>
            <p className="text-xs text-gray-500 mt-1">Personas</p>
          </div>
          <div className="card py-3">
            <p className="text-2xl font-bold" style={{ color: ORANGE }}>
              {familiares}F · {grupales}G · {empresariales}E
            </p>
            <p className="text-xs text-gray-500 mt-1">Por tipo</p>
          </div>
        </div>

        {reportes.length === 0 ? (
          <div className="card text-center space-y-2 py-8">
            <div className="text-4xl">📭</div>
            <p className="font-semibold text-gray-700">Aún no has reportado ningún devocional</p>
            <p className="text-sm text-gray-500">Cuando reportes tus participaciones aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportes.map(r => {
              const badge   = tipoBadge(r.tipo)
              const total_r = totalPersonas(r)
              return (
                <div key={r.id} className="card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {r.devocionales?.titulo ?? 'Devocional eliminado'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Nombre grupo o empresa */}
                  {r.tipo === 'grupal' && r.nombre_grupo && (
                    <p className="text-xs text-gray-600">👥 {r.nombre_grupo}</p>
                  )}
                  {r.tipo === 'empresarial' && r.nombre_empresa && (
                    <p className="text-xs text-gray-600">🏢 {r.nombre_empresa}</p>
                  )}

                  {/* Participantes */}
                  <div className="flex gap-2 flex-wrap">
                    {r.tipo === 'familiar' ? (
                      <span className="badge bg-gray-100 text-gray-600">
                        👨‍👩‍👧 {r.adultos ?? 0} adultos · {r.ninos ?? 0} niños
                      </span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-600">
                        {total_r} {total_r === 1 ? 'persona' : 'personas'}
                      </span>
                    )}
                    {r.hubo_ofrenda && (
                      <span className="badge text-white" style={{ background: TEAL }}>
                        Ofrenda{r.monto_ofrenda ? `: ${simbolo(r.moneda_ofrenda)}${r.monto_ofrenda.toLocaleString()} ${r.moneda_ofrenda ?? ''}` : ''}
                      </span>
                    )}
                  </div>

                  {r.devocionales?.pasaje && (
                    <p className="text-xs italic" style={{ color: PRIMARY }}>"{r.devocionales.pasaje}"</p>
                  )}

                  {r.nota && (
                    <p className="text-xs text-gray-500 italic border-t border-gray-50 pt-2">"{r.nota}"</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </AppShell>
  )
}
