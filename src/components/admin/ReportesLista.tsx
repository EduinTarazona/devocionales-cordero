'use client'

type Props = { reportes: any[]; totalMiembros: number }

const PRIMARY = '#3B3B8E'
const ORANGE  = '#F7941D'
const LIGHT   = '#EBEBF8'

export default function ReportesLista({ reportes, totalMiembros }: Props) {
  const totalPersonas   = reportes.reduce((s, r) => s + (r.personas_participaron ?? 0), 0)
  const conOfrenda      = reportes.filter(r => r.hubo_ofrenda)
  const totalOfrenda    = conOfrenda.reduce((s, r) => s + (r.monto_ofrenda ?? 0), 0)
  const noReportaron    = Math.max(0, totalMiembros - reportes.length)
  const pct             = totalMiembros > 0 ? Math.round((reportes.length / totalMiembros) * 100) : 0
  const promedio        = reportes.length > 0 ? (totalPersonas / reportes.length).toFixed(1) : '—'
  const promedioOfrenda = conOfrenda.length > 0 ? Math.round(totalOfrenda / conOfrenda.length) : 0

  // Barras: top 8 por personas
  const barData = [...reportes]
    .sort((a, b) => (b.personas_participaron ?? 0) - (a.personas_participaron ?? 0))
    .slice(0, 8)
  const maxPersonas = barData[0]?.personas_participaron ?? 1

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

  return (
    <div className="space-y-4 pb-6">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <KPI icon="🏠" label="Familias" value={`${reportes.length}/${totalMiembros}`}
          sub={`${pct}% participación`} accent={PRIMARY} />
        <KPI icon="👥" label="Personas alcanzadas" value={String(totalPersonas)}
          sub="esta semana" accent={ORANGE} />
        <KPI icon="📊" label="Promedio / familia" value={String(promedio)}
          sub="personas por hogar" accent={PRIMARY} />
        <KPI icon="💛" label="Ofrenda semana"
          value={totalOfrenda > 0 ? `$${totalOfrenda.toLocaleString()}` : '—'}
          sub={conOfrenda.length > 0 ? `${conOfrenda.length} familias dieron` : 'Sin ofrendas'} accent={ORANGE} />
      </div>

      {/* ── Participación + Ofrenda ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Donut SVG */}
        <div className="card flex flex-col items-center py-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Participación</p>
          <div className="relative" style={{ width: 112, height: 112 }}>
            <svg width="112" height="112" viewBox="0 0 112 112">
              {/* Pista gris */}
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#E5E7EB" strokeWidth="10" />
              {/* Arco de participación */}
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
          <p className="text-[10px] text-gray-400 mt-1 text-center">
            {reportes.length} sí · {noReportaron} pendientes
          </p>
        </div>

        {/* Ofrenda */}
        <div className="card py-4 space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ofrenda</p>
          <BarraProgreso
            label="Familias que dieron"
            value={conOfrenda.length}
            total={reportes.length}
            color={ORANGE}
          />
          {totalOfrenda > 0 ? (
            <div className="space-y-1.5 pt-1">
              <FilaOfrenda label="Total recaudado" value={`$${totalOfrenda.toLocaleString()}`} bold accent={ORANGE} />
              <FilaOfrenda label="Promedio familia" value={`$${promedioOfrenda.toLocaleString()}`} />
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 italic">Sin montos registrados</p>
          )}
        </div>
      </div>

      {/* ── Barras: personas por familia ── */}
      {barData.length > 0 && (
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">Personas por familia</p>
          <div className="space-y-2">
            {barData.map((r, i) => {
              const nombre = (r.perfiles?.nombre ?? r.perfiles?.email ?? 'Miembro').split(' ')[0]
              const n = r.personas_participaron ?? 0
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

      {/* ── Actividad por día ── */}
      {diasData.length > 0 && (
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">Actividad por día</p>
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

      {/* ── Lista detalle ── */}
      <div className="card">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
          Detalle · {reportes.length} reporte{reportes.length !== 1 ? 's' : ''}
        </p>
        {reportes.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">Nadie ha reportado aún esta semana.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {reportes.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {r.perfiles?.nombre ?? r.perfiles?.email ?? 'Miembro'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  {r.nota && (
                    <p className="text-[11px] text-gray-500 italic mt-0.5 truncate">"{r.nota}"</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                  {r.hubo_ofrenda && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#FEF3E2', color: ORANGE }}>
                      {r.monto_ofrenda ? `$${r.monto_ofrenda.toLocaleString()}` : '💛'}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: LIGHT, color: PRIMARY }}>
                    {r.personas_participaron} pers.
                  </span>
                </div>
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
      <p className="text-[22px] font-extrabold leading-none mb-0.5" style={{ color: accent }}>{value}</p>
      <p className="text-[11px] text-gray-400">{sub}</p>
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
