'use client'
import { puedeVerEconomico, esPastorRed } from '@/lib/roles'

type Props = { reportes: any[]; totalMiembros: number; rol?: string; redAsignada?: string | null }

const PRIMARY = '#3B3B8E'
const ORANGE  = '#F7941D'
const TEAL    = '#0D9488'
const LIGHT   = '#EBEBF8'

function totalParticiparon(r: any) {
  if (r.adultos != null || r.ninos != null) return (r.adultos ?? 0) + (r.ninos ?? 0)
  return r.personas_participaron ?? 0
}

function simboloMoneda(moneda: string | null) {
  if (moneda === 'Bs') return 'Bs.'
  return '$'
}

export default function ReportesLista({ reportes, totalMiembros, rol = 'admin', redAsignada }: Props) {
  const verEconomico = puedeVerEconomico(rol)
  const esPastorDeRed = esPastorRed(rol)

  // ── Separar por tipo ──
  const familiares   = reportes.filter(r => !r.tipo || r.tipo === 'familiar')
  const grupales     = reportes.filter(r => r.tipo === 'grupal')
  const empresariales = reportes.filter(r => r.tipo === 'empresarial')

  // ── Totales generales ──
  const totalPersonas   = reportes.reduce((s, r) => s + totalParticiparon(r), 0)
  const personasFam     = familiares.reduce((s, r) => s + totalParticiparon(r), 0)
  const personasGrup    = grupales.reduce((s, r) => s + totalParticiparon(r), 0)
  const personasEmp     = empresariales.reduce((s, r) => s + totalParticiparon(r), 0)
  const totalAdultos    = familiares.reduce((s, r) => s + (r.adultos ?? 0), 0)
  const totalNinos      = familiares.reduce((s, r) => s + (r.ninos ?? 0), 0)

  // ── Ofrenda ──
  const conOfrenda      = reportes.filter(r => r.hubo_ofrenda)
  const totalOfrenda    = conOfrenda.reduce((s, r) => s + (r.monto_ofrenda ?? 0), 0)
  const promedioOfrenda = conOfrenda.length > 0 ? Math.round(totalOfrenda / conOfrenda.length) : 0
  const monedaPred      = conOfrenda.length > 0 ? (conOfrenda[0].moneda_ofrenda ?? 'USD') : 'USD'
  const simbolo         = simboloMoneda(monedaPred)

  // ── Participación familiar ──
  const noReportaron = Math.max(0, totalMiembros - familiares.length)
  const pct          = totalMiembros > 0 ? Math.round((familiares.length / totalMiembros) * 100) : 0

  // ── Redes ──
  const redesMap: Record<string, number> = {}
  reportes.forEach(r => {
    if (r.red) redesMap[r.red] = (redesMap[r.red] || 0) + 1
  })
  const redesData = Object.entries(redesMap).sort((a, b) => b[1] - a[1])
  const maxRed = redesData.length > 0 ? redesData[0][1] : 1

  // ── Donut ──
  const R = 44, CX = 56, CY = 56
  const circum = 2 * Math.PI * R
  const filled = (familiares.length / Math.max(totalMiembros, 1)) * circum

  // ── Texto narrativo ──
  function textoResumen() {
    if (reportes.length === 0) return esPastorDeRed
      ? `Aún no hay reportes esta semana en la Red ${redAsignada ?? ''}.`
      : 'Aún no hay reportes esta semana.'

    const partes: string[] = []
    if (familiares.length > 0)
      partes.push(`${familiares.length} ${familiares.length === 1 ? 'Casa de Vida familiar' : 'Casas de Vida familiares'} con ${personasFam} personas`)
    if (grupales.length > 0)
      partes.push(`${grupales.length} ${grupales.length === 1 ? 'grupo' : 'grupos'} con ${personasGrup} personas`)
    if (empresariales.length > 0)
      partes.push(`${empresariales.length} ${empresariales.length === 1 ? 'empresa' : 'empresas'} con ${personasEmp} personas`)

    const contexto = esPastorDeRed ? `En la Red ${redAsignada ?? ''}, ` : 'Esta semana, '
    let texto = `${contexto}se recibieron reportes de: ${partes.join(', ')}. En total, ${totalPersonas} personas participaron en el devocional.`
    if (noReportaron > 0 && !esPastorDeRed)
      texto += ` ${noReportaron} ${noReportaron === 1 ? 'Casa de Vida familiar no ha' : 'Casas de Vida familiares no han'} reportado aún.`
    return texto
  }

  return (
    <div className="space-y-4 pb-6">

      {/* ── Resumen narrativo ── */}
      <div className="rounded-2xl px-4 py-4" style={{ background: LIGHT }}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: PRIMARY }}>
          {esPastorDeRed ? `Red ${redAsignada ?? ''} · Resumen` : 'Resumen de la semana'}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{textoResumen()}</p>
        {verEconomico && conOfrenda.length > 0 && (
          <p className="text-sm text-gray-700 mt-1">
            {conOfrenda.length} {conOfrenda.length === 1 ? 'familia entregó ofrenda' : 'familias entregaron ofrenda'}
            {totalOfrenda > 0 ? ` por un total de ${simbolo}${totalOfrenda.toLocaleString()} ${monedaPred}.` : '.'}
          </p>
        )}
      </div>

      {/* ── KPIs por tipo ── */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
          Alcance por tipo de devocional
        </p>
        <p className="text-[11px] text-gray-400 mb-3 px-1">
          Cada tipo de devocional se reporta por separado. Aquí se ve cuánto impacto tuvo cada uno esta semana.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <TipoCard
            emoji="🏠" label="Familiar"
            reportes={familiares.length} personas={personasFam}
            color={PRIMARY}
            sub={totalMiembros > 0 ? `${pct}% participó` : undefined}
          />
          <TipoCard
            emoji="👥" label="Grupal"
            reportes={grupales.length} personas={personasGrup}
            color={ORANGE}
            sub={grupales.length > 0 ? `${grupales.length} grupo${grupales.length > 1 ? 's' : ''}` : 'Sin reportes'}
          />
          <TipoCard
            emoji="🏢" label="Empresarial"
            reportes={empresariales.length} personas={personasEmp}
            color={TEAL}
            sub={empresariales.length > 0 ? `${empresariales.length} empresa${empresariales.length > 1 ? 's' : ''}` : 'Sin reportes'}
          />
        </div>
      </div>

      {/* ── Total personas alcanzadas ── */}
      <div className="card">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
          Total de personas alcanzadas
        </p>
        <p className="text-[11px] text-gray-400 mb-3">
          Suma de todas las personas que participaron en cualquier tipo de devocional esta semana.
        </p>
        <div className="flex items-end gap-4">
          <div>
            <p className="text-4xl font-extrabold" style={{ color: PRIMARY }}>{totalPersonas}</p>
            <p className="text-xs text-gray-400 mt-1">personas en total</p>
          </div>
          <div className="flex-1 space-y-2 pb-1">
            {familiares.length > 0 && (
              <MiniBarra label={`Familiar (${personasFam})`} value={personasFam} max={totalPersonas} color={PRIMARY} />
            )}
            {grupales.length > 0 && (
              <MiniBarra label={`Grupal (${personasGrup})`} value={personasGrup} max={totalPersonas} color={ORANGE} />
            )}
            {empresariales.length > 0 && (
              <MiniBarra label={`Empresarial (${personasEmp})`} value={personasEmp} max={totalPersonas} color={TEAL} />
            )}
          </div>
        </div>
        {familiares.length > 0 && (
          <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-50">
            En el familiar: {totalAdultos} adultos y {totalNinos} niños.
          </p>
        )}
      </div>

      {/* ── Participación familiar + Ofrenda ── */}
      <div className={`grid gap-3 ${verEconomico ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className={`card py-4 ${verEconomico ? 'flex flex-col items-center' : 'flex items-center gap-6 px-6'}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
            ¿Cuántas familias reportaron?
          </p>
          <div className="relative flex-shrink-0" style={{ width: 112, height: 112 }}>
            <svg width="112" height="112" viewBox="0 0 112 112">
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle cx={CX} cy={CY} r={R} fill="none" stroke={PRIMARY} strokeWidth="10"
                strokeDasharray={`${filled} ${circum}`} strokeLinecap="round"
                transform={`rotate(-90 ${CX} ${CY})`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold" style={{ color: PRIMARY }}>{pct}%</span>
              <span className="text-[9px] text-gray-400">familiar</span>
            </div>
          </div>
          {verEconomico ? (
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              {familiares.length} reportaron · {noReportaron} pendientes
            </p>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-700">{familiares.length} {familiares.length === 1 ? 'familia reportó' : 'familias reportaron'}</p>
              <p className="text-[12px] text-gray-400">{noReportaron > 0 ? `${noReportaron} pendientes · ` : ''}{personasFam} personas alcanzadas</p>
            </div>
          )}
        </div>

        {verEconomico && (
          <div className="card py-4 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ofrenda familiar</p>
            <BarraProgreso label="Familias que dieron" value={conOfrenda.length} total={familiares.length} color={ORANGE} />
            {totalOfrenda > 0 ? (
              <div className="space-y-1.5 pt-1">
                <FilaOfrenda label="Total recaudado" value={`${simbolo}${totalOfrenda.toLocaleString()} ${monedaPred}`} bold accent={ORANGE} />
                <FilaOfrenda label="Promedio por familia" value={`${simbolo}${promedioOfrenda.toLocaleString()} ${monedaPred}`} />
                <p className="text-[10px] text-gray-400 italic pt-1">Solo se suman los montos registrados.</p>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 italic">
                {conOfrenda.length > 0 ? 'Marcaron ofrenda pero sin monto.' : 'Ninguna familia registró ofrenda.'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Grupos que reportaron ── */}
      {grupales.length > 0 && (
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Grupos que reportaron</p>
          <p className="text-[11px] text-gray-400 mb-3">
            Estos son los grupos de Casa de Vida que realizaron su devocional grupal esta semana.
          </p>
          <div className="divide-y divide-gray-50">
            {grupales.map(r => (
              <div key={r.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.nombre_grupo ?? 'Sin nombre'}</p>
                  <p className="text-[11px] text-gray-400">
                    Líder: {r.perfiles?.nombre ?? r.perfiles?.email ?? '—'}
                    {r.red ? ` · Red ${r.red}` : ''}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#FEF3E2', color: ORANGE }}>
                  {totalParticiparon(r)} personas
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empresas que reportaron ── */}
      {empresariales.length > 0 && (
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Empresas que reportaron</p>
          <p className="text-[11px] text-gray-400 mb-3">
            Empresas del sueño donde se realizó el devocional empresarial esta semana.
          </p>
          <div className="divide-y divide-gray-50">
            {empresariales.map(r => (
              <div key={r.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.nombre_empresa ?? 'Sin nombre'}</p>
                  <p className="text-[11px] text-gray-400">
                    Líder: {r.perfiles?.nombre ?? r.perfiles?.email ?? '—'}
                    {r.red ? ` · Red ${r.red}` : ''}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#CCFBF1', color: TEAL }}>
                  {totalParticiparon(r)} personas
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Redes más activas ── */}
      {redesData.length > 0 && (
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Redes más activas</p>
          <p className="text-[11px] text-gray-400 mb-3">
            Cantidad de reportes recibidos por red, contando todos los tipos de devocional.
          </p>
          <div className="space-y-2">
            {redesData.map(([red, total]) => (
              <div key={red} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-14 flex-shrink-0">Red {red}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.round((total / maxRed) * 100)}%`, background: `linear-gradient(90deg, ${PRIMARY}, #5B5BBE)` }}>
                    <span className="text-[9px] font-bold text-white">{total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lista completa de reportes ── */}
      <div className="card">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
          {esPastorDeRed ? `Todos los reportes · Red ${redAsignada ?? ''}` : 'Todos los reportes recibidos'}
        </p>
        <p className="text-[11px] text-gray-400 mb-3">
          {reportes.length === 0 ? 'Nadie ha reportado aún esta semana.' : `${reportes.length} ${reportes.length === 1 ? 'reporte recibido' : 'reportes recibidos'} en total.`}
        </p>
        {reportes.length > 0 && (
          <div className="divide-y divide-gray-50">
            {reportes.map(r => {
              const tipo = r.tipo ?? 'familiar'
              const badgeColor = tipo === 'grupal' ? { bg: '#FEF3E2', text: ORANGE } : tipo === 'empresarial' ? { bg: '#CCFBF1', text: TEAL } : { bg: LIGHT, text: PRIMARY }
              return (
                <div key={r.id} className="py-2.5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {r.perfiles?.nombre ?? r.perfiles?.email ?? 'Miembro'}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: badgeColor.bg, color: badgeColor.text }}>
                        {tipo}
                      </span>
                      {r.hubo_ofrenda && verEconomico && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEF3E2', color: ORANGE }}>
                          {r.monto_ofrenda ? `${simboloMoneda(r.moneda_ofrenda)}${r.monto_ofrenda.toLocaleString()}` : '💛'}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: LIGHT, color: PRIMARY }}>
                        {totalParticiparon(r)} pers.
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    <p className="text-[11px] text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                    {tipo === 'familiar' && (r.adultos != null || r.ninos != null) && (
                      <p className="text-[11px] text-gray-500">👨‍👩‍👧 {r.adultos ?? 0} adultos · {r.ninos ?? 0} niños</p>
                    )}
                    {tipo === 'grupal' && r.nombre_grupo && (
                      <p className="text-[11px] text-gray-500">👥 {r.nombre_grupo}</p>
                    )}
                    {tipo === 'empresarial' && r.nombre_empresa && (
                      <p className="text-[11px] text-gray-500">🏢 {r.nombre_empresa}</p>
                    )}
                    {r.red && <p className="text-[11px] text-gray-500">🔴 Red {r.red}</p>}
                  </div>
                  {r.nota && <p className="text-[11px] text-gray-500 italic truncate">"{r.nota}"</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

/* ── Componentes auxiliares ── */

function TipoCard({ emoji, label, reportes, personas, color, sub }: {
  emoji: string; label: string; reportes: number; personas: number; color: string; sub?: string
}) {
  return (
    <div className="card py-3 text-center">
      <span className="text-xl">{emoji}</span>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color }}>{personas}</p>
      <p className="text-[10px] text-gray-400">personas</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function MiniBarra({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function BarraProgreso({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
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

function FilaOfrenda({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: string }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold' : 'font-medium text-gray-700'} style={accent ? { color: accent } : {}}>
        {value}
      </span>
    </div>
  )
}
