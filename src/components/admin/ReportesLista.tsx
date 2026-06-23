'use client'
import { puedeVerEconomico, esPastorRed } from '@/lib/roles'

type Props = { reportes: any[]; totalMiembros: number; rol?: string; redAsignada?: string | null }

const PRIMARY = '#3B3B8E'
const ORANGE  = '#F7941D'
const LIGHT   = '#EBEBF8'

function totalParticiparon(r: any) {
  if (!r) return 0
  if (r.adultos != null || r.ninos != null) return (r.adultos ?? 0) + (r.ninos ?? 0)
  return r.personas_participaron ?? 0
}

function simboloMoneda(moneda: string | null) {
  if (moneda === 'Bs') return 'Bs.'
  if (moneda === 'Pesos') return '$'
  return '$'
}

export default function ReportesLista({ reportes, totalMiembros, rol = 'admin', redAsignada }: Props) {
  const verEconomico = puedeVerEconomico(rol)
  const esPastorDeRed = esPastorRed(rol)

  const totalPersonas   = reportes.reduce((s, r) => s + totalParticiparon(r), 0)
  const totalAdultos    = reportes.reduce((s, r) => s + (r.adultos ?? 0), 0)
  const totalNinos      = reportes.reduce((s, r) => s + (r.ninos ?? 0), 0)
  const conOfrenda      = reportes.filter(r => r.hubo_ofrenda)
  const totalOfrenda    = conOfrenda.reduce((s, r) => s + (r.monto_ofrenda ?? 0), 0)
  const noReportaron    = Math.max(0, totalMiembros - reportes.length)
  const pct             = totalMiembros > 0 ? Math.round((reportes.length / totalMiembros) * 100) : 0
  const promedio        = reportes.length > 0 ? (totalPersonas / reportes.length).toFixed(1) : '—'
  const promedioOfrenda = conOfrenda.length > 0 ? Math.round(totalOfrenda / conOfrenda.length) : 0
  const monedaPred      = conOfrenda.length > 0 ? (conOfrenda[0].moneda_ofrenda ?? 'USD') : 'USD'
  const simbolo         = simboloMoneda(monedaPred)

  // Barras: top 8 por personas
  const barData = [...reportes]
    .sort((a, b) => totalParticiparon(b) - totalParticiparon(a))
    .slice(0, 8)
  const maxPersonas = barData.length > 0 ? (totalParticiparon(barData[0]) || 1) : 1

  // Actividad por día
  const diasMap: Record<string, number> = {}
  reportes.forEach(r => {
    const d = new Date(r.created_at).toLocaleDateString('es', { weekday: 'short' })
    diasMap[d] = (diasMap[d] || 0) + 1
  })
  const diasData = Object.entries(diasMap)
  const maxDia = Math.max(...diasData.map(([, v]) => v), 1)

  // SVG donut
  const R = 44, CX = 56, CY = 56
  const circum = 2 * Math.PI * R
  const filled = (reportes.length / Math.max(totalMiembros, 1)) * circum

  // Texto narrativo del resumen
  function textoResumen() {
    if (reportes.length === 0) {
      return esPastorDeRed
        ? `Aún no hay reportes esta semana en la Red ${redAsignada ?? ''}.`
        : 'Aún no hay reportes esta semana.'
    }
    const contexto = esPastorDeRed
      ? `En la Red ${redAsignada ?? ''}, `
      : 'Esta semana, '
    let texto = `${contexto}${reportes.length} ${reportes.length === 1 ? 'familia reportó' : 'familias reportaron'} su devocional`
    if (totalMiembros > 0) {
      texto += `, lo que representa el ${pct}% de participación`
    }
    texto += `. En total, ${totalPersonas} ${totalPersonas === 1 ? 'persona participó' : 'personas participaron'}`
    if (totalAdultos > 0 || totalNinos > 0) {
      texto += ` (${totalAdultos} ${totalAdultos === 1 ? 'adulto' : 'adultos'} y ${totalNinos} ${totalNinos === 1 ? 'niño' : 'niños'})`
    }
    texto += '.'
    if (noReportaron > 0 && !esPastorDeRed) {
      texto += ` Faltan ${noReportaron} ${noReportaron === 1 ? 'familia' : 'familias'} por reportar.`
    }
    return texto
  }

  return (
    <div className="space-y-4 pb-6">

      {/* ── Resumen narrativo ── */}
      <div className="rounded-2xl px-4 py-4" style={{ background: LIGHT }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: PRIMARY }}>
          {esPastorDeRed ? `Red ${redAsignada ?? ''} · Resumen de la semana` : 'Resumen de la semana'}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{textoResumen()}</p>
        {verEconomico && conOfrenda.length > 0 && (
          <p className="text-sm text-gray-700 mt-1">
            En cuanto a la ofrenda, {conOfrenda.length} {conOfrenda.length === 1 ? 'familia entregó' : 'familias entregaron'}{totalOfrenda > 0 ? ` un total de ${simbolo}${totalOfrenda.toLocaleString()} ${monedaPred}` : ' ofrenda sin monto registrado'}.
          </p>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className={`grid gap-3 ${verEconomico ? 'grid-cols-2' : 'grid-cols-2'}`}>

        <KPI
          icon="🏠"
          label="Familias que reportaron"
          value={totalMiembros > 0 ? `${reportes.length} de ${totalMiembros}` : String(reportes.length)}
          sub={pct > 0 ? `${pct}% de participación esta semana` : 'Sin miembros registrados aún'}
          accent={PRIMARY}
        />

        <KPI
          icon="👥"
          label="Personas alcanzadas"
          value={String(totalPersonas)}
          sub={totalAdultos > 0 || totalNinos > 0
            ? `${totalAdultos} adultos · ${totalNinos} niños`
            : 'Total de participantes'}
          accent={ORANGE}
        />

        <KPI
          icon="📊"
          label="Promedio por familia"
          value={String(promedio)}
          sub="personas en cada hogar que reportó"
          accent={PRIMARY}
        />

        {verEconomico ? (
          <KPI
            icon="💛"
            label="Ofrenda esta semana"
            value={totalOfrenda > 0 ? `${simbolo}${totalOfrenda.toLocaleString()}` : '—'}
            sub={conOfrenda.length > 0
              ? `${conOfrenda.length} de ${reportes.length} familias dieron`
              : 'Ninguna familia registró ofrenda'}
            accent={ORANGE}
          />
        ) : noReportaron > 0 ? (
          <KPI
            icon="⏳"
            label="Pendientes"
            value={String(noReportaron)}
            sub={`${noReportaron === 1 ? 'familia no ha' : 'familias no han'} reportado aún`}
            accent="#9CA3AF"
          />
        ) : (
          <KPI
            icon="✅"
            label="Participación"
            value={pct > 0 ? `${pct}%` : '—'}
            sub="de las familias reportaron esta semana"
            accent="#10B981"
          />
        )}
      </div>

      {/* ── Participación + Ofrenda ── */}
      <div className={`grid gap-3 ${verEconomico ? 'grid-cols-2' : 'grid-cols-1'}`}>

        {/* Donut SVG */}
        <div className={`card py-4 ${verEconomico ? 'flex flex-col items-center' : 'flex items-center gap-6 px-6'}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
            ¿Cuántos reportaron?
          </p>
          <div className="relative flex-shrink-0" style={{ width: 112, height: 112 }}>
            <svg width="112" height="112" viewBox="0 0 112 112">
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle
                cx={CX} cy={CY} r={R} fill="none"
                stroke={PRIMARY} strokeWidth="10"
                strokeDasharray={`${filled} ${circum}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${CX} ${CY})`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold" style={{ color: PRIMARY }}>{pct}%</span>
              <span className="text-[9px] text-gray-400">reportaron</span>
            </div>
          </div>
          {verEconomico ? (
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              {reportes.length} reportaron · {noReportaron} pendientes
            </p>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-700">{reportes.length} {reportes.length === 1 ? 'familia reportó' : 'familias reportaron'}</p>
              <p className="text-[12px] text-gray-400">
                {noReportaron > 0 ? `${noReportaron} pendientes · ` : ''}{totalPersonas} personas alcanzadas
              </p>
            </div>
          )}
        </div>

        {/* Ofrenda — solo para roles con acceso económico */}
        {verEconomico && (
          <div className="card py-4 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ofrenda familiar</p>
            <BarraProgreso
              label="Familias que dieron ofrenda"
              value={conOfrenda.length}
              total={reportes.length}
              color={ORANGE}
            />
            {totalOfrenda > 0 ? (
              <div className="space-y-1.5 pt-1">
                <FilaOfrenda label="Total recaudado" value={`${simbolo}${totalOfrenda.toLocaleString()} ${monedaPred}`} bold accent={ORANGE} />
                <FilaOfrenda label="Promedio por familia" value={`${simbolo}${promedioOfrenda.toLocaleString()} ${monedaPred}`} />
                <p className="text-[10px] text-gray-400 italic pt-1">
                  Solo se suman los montos donde la familia indicó un valor.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 italic">Las familias marcaron ofrenda pero no registraron monto.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Casas con más participantes ── */}
      {barData.length > 0 && (
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
            Participantes por Casa de Vida
          </p>
          <p className="text-[11px] text-gray-400 mb-3">
            Cuántas personas tuvo cada familia en su devocional esta semana.
          </p>
          <div className="space-y-2">
            {barData.map((r, i) => {
              const nombre = (r.perfiles?.nombre ?? r.perfiles?.email ?? 'Miembro').split(' ')[0]
              const n = totalParticiparon(r)
              const w = Math.round((n / maxPersonas) * 100)
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 w-16 truncate flex-shrink-0">{nombre}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${w}%`, background: `linear-gradient(90deg, ${PRIMARY}, #5B5BBE)` }}
                    >
                      <span className="text-[9px] font-bold text-white">{n}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Días de mayor actividad ── */}
      {diasData.length > 0 && (
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
            ¿Qué días reportaron más?
          </p>
          <p className="text-[11px] text-gray-400 mb-3">
            Días de la semana en los que las familias enviaron su reporte.
          </p>
          <div className="flex items-end gap-2 h-20">
            {diasData.map(([dia, total], i) => {
              const h = Math.round((total / maxDia) * 100)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-gray-600">{total}</span>
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${h}%`, background: ORANGE, minHeight: 6 }} />
                  <span className="text-[9px] text-gray-400 capitalize">{dia}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Lista de reportes ── */}
      <div className="card">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
          {esPastorDeRed ? `Reportes de la Red ${redAsignada ?? ''}` : 'Reportes recibidos'}
        </p>
        <p className="text-[11px] text-gray-400 mb-3">
          {reportes.length === 0
            ? 'Nadie ha reportado aún esta semana.'
            : `${reportes.length} ${reportes.length === 1 ? 'reporte recibido' : 'reportes recibidos'} esta semana.`}
        </p>
        {reportes.length > 0 && (
          <div className="divide-y divide-gray-50">
            {reportes.map(r => (
              <div key={r.id} className="py-2.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {r.perfiles?.nombre ?? r.perfiles?.email ?? 'Miembro'}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                    {r.hubo_ofrenda && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#FEF3E2', color: ORANGE }}>
                        {verEconomico && r.monto_ofrenda
                          ? `${simboloMoneda(r.moneda_ofrenda)}${r.monto_ofrenda.toLocaleString()} ${r.moneda_ofrenda ?? 'USD'}`
                          : '💛 ofrenda'}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: LIGHT, color: PRIMARY }}>
                      {totalParticiparon(r)} pers.
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  <p className="text-[11px] text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  {(r.adultos != null || r.ninos != null) && (
                    <p className="text-[11px] text-gray-500">
                      👨‍👩‍👧 {r.adultos ?? 0} adultos · {r.ninos ?? 0} niños
                    </p>
                  )}
                  {r.red && (
                    <p className="text-[11px] text-gray-500">🔴 Red {r.red}</p>
                  )}
                </div>
                {r.nota && (
                  <p className="text-[11px] text-gray-500 italic truncate">"{r.nota}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

/* ── Componentes auxiliares ── */

function KPI({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string; sub: string; accent: string
}) {
  return (
    <div className="card py-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-base">{icon}</span>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-tight">{label}</p>
      </div>
      <p className="text-[22px] font-extrabold leading-none mb-1" style={{ color: accent }}>{value}</p>
      <p className="text-[11px] text-gray-400 leading-snug">{sub}</p>
    </div>
  )
}

function BarraProgreso({ label, value, total, color }: {
  label: string; value: number; total: number; color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-gray-500">
        <span>{label}</span>
        <span className="font-semibold">{value}/{total}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function FilaOfrenda({ label, value, bold, accent }: {
  label: string; value: string; bold?: boolean; accent?: string
}) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold' : 'font-medium text-gray-700'} style={accent ? { color: accent } : {}}>
        {value}
      </span>
    </div>
  )
}
