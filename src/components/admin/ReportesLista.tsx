'use client'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Props = { reportes: any[]; totalMiembros: number }

const PRIMARY = '#3B3B8E'
const ORANGE  = '#F7941D'
const LIGHT   = '#EBEBF8'
const GRAY    = '#E5E7EB'

export default function ReportesLista({ reportes, totalMiembros }: Props) {
  const totalPersonas   = reportes.reduce((s, r) => s + (r.personas_participaron ?? 0), 0)
  const conOfrenda      = reportes.filter(r => r.hubo_ofrenda)
  const totalOfrenda    = conOfrenda.reduce((s, r) => s + (r.monto_ofrenda ?? 0), 0)
  const noReportaron    = Math.max(0, totalMiembros - reportes.length)
  const pct             = totalMiembros > 0 ? Math.round((reportes.length / totalMiembros) * 100) : 0
  const promedio        = reportes.length > 0 ? (totalPersonas / reportes.length).toFixed(1) : '—'
  const promedioOfrenda = conOfrenda.length > 0 ? Math.round(totalOfrenda / conOfrenda.length) : 0

  // Donut participación
  const donutData = [
    { name: 'Reportaron',   value: reportes.length },
    { name: 'Sin reportar', value: noReportaron },
  ]

  // Barras: personas por familia (top 8)
  const barData = [...reportes]
    .sort((a, b) => (b.personas_participaron ?? 0) - (a.personas_participaron ?? 0))
    .slice(0, 8)
    .map(r => ({
      nombre: (r.perfiles?.nombre ?? r.perfiles?.email ?? 'Miembro').split(' ')[0],
      personas: r.personas_participaron ?? 0,
    }))

  // Actividad por día
  const diasMap: Record<string, number> = {}
  reportes.forEach(r => {
    const d = new Date(r.created_at).toLocaleDateString('es', { weekday: 'short' })
    diasMap[d] = (diasMap[d] || 0) + 1
  })
  const diasData = Object.entries(diasMap).map(([dia, total]) => ({ dia, total }))

  return (
    <div className="space-y-5 pb-6">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <KPI icon="🏠" label="Familias" value={`${reportes.length} / ${totalMiembros}`}
          sub={`${pct}% participación`} accent={PRIMARY} />
        <KPI icon="👥" label="Personas alcanzadas" value={totalPersonas}
          sub="esta semana" accent={ORANGE} />
        <KPI icon="📊" label="Promedio / familia" value={promedio}
          sub="personas por hogar" accent={PRIMARY} />
        <KPI icon="💛" label="Ofrenda semana" value={totalOfrenda > 0 ? `$${totalOfrenda.toLocaleString()}` : '—'}
          sub={conOfrenda.length > 0 ? `${conOfrenda.length} familias dieron` : 'Sin ofrendas registradas'} accent={ORANGE} />
      </div>

      {/* ── Participación + Ofrenda ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Donut participación */}
        <div className="card flex flex-col items-center py-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Participación</p>
          <div className="relative">
            <PieChart width={120} height={120}>
              <Pie data={donutData} cx={55} cy={55} innerRadius={36} outerRadius={52}
                dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                <Cell fill={PRIMARY} />
                <Cell fill={GRAY} />
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-extrabold" style={{ color: PRIMARY }}>{pct}%</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 text-center">
            {reportes.length} reportaron · {noReportaron} pendientes
          </p>
        </div>

        {/* Ofrenda breakdown */}
        <div className="card py-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ofrenda</p>
          <div className="space-y-2">
            <StatRow label="Familias que dieron" value={conOfrenda.length} total={reportes.length} color={ORANGE} />
            {totalOfrenda > 0 && (
              <>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Total recaudado</span>
                  <span className="font-bold" style={{ color: ORANGE }}>${totalOfrenda.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Promedio por familia</span>
                  <span className="font-semibold text-gray-700">${promedioOfrenda.toLocaleString()}</span>
                </div>
              </>
            )}
            {totalOfrenda === 0 && (
              <p className="text-xs text-gray-400 italic">Sin montos registrados</p>
            )}
          </div>
        </div>

      </div>

      {/* ── Barras: personas por familia ── */}
      {barData.length > 0 && (
        <div className="card">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Personas por familia</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={(v: any) => [`${v} personas`, '']}
                labelStyle={{ fontWeight: 600, color: '#111' }}
              />
              <Bar dataKey="personas" fill={PRIMARY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Actividad por día ── */}
      {diasData.length > 1 && (
        <div className="card">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Actividad por día</p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={diasData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={(v: any) => [`${v} reportes`, '']}
              />
              <Bar dataKey="total" fill={ORANGE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Lista de reportes ── */}
      <div className="card">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Detalle de reportes ({reportes.length})
        </p>
        {reportes.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">Nadie ha reportado aún esta semana.</p>
        ) : (
          <div className="space-y-2">
            {reportes.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
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
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {r.hubo_ofrenda && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#FEF3E2', color: ORANGE }}>
                      {r.monto_ofrenda ? `$${r.monto_ofrenda.toLocaleString()}` : 'Ofrenda'}
                    </span>
                  )}
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
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

/* ── Helpers ── */

function KPI({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string | number; sub: string; accent: string
}) {
  return (
    <div className="card py-4 space-y-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-extrabold leading-none" style={{ color: accent }}>{value}</p>
      <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  )
}

function StatRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className="font-semibold">{value} / {total}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
