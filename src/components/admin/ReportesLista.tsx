'use client'
type Props = { reportes: any[]; totalMiembros: number }

export default function ReportesLista({ reportes, totalMiembros }: Props) {
  const totalPersonas = reportes.reduce((s, r) => s + (r.personas_participaron ?? 0), 0)
  const conOfrenda = reportes.filter(r => r.hubo_ofrenda)
  const totalOfrenda = conOfrenda.reduce((s, r) => s + (r.monto_ofrenda ?? 0), 0)
  const noReportaron = Math.max(0, totalMiembros - reportes.length)

  return (
    <div className="space-y-5">

      {/* Resumen */}
      <div className="card space-y-2">
        <h2 className="font-bold text-gray-900">Reportes esta semana</h2>
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div>
            <p className="text-2xl font-bold text-primary">{reportes.length}</p>
            <p className="text-xs text-gray-400">Familias</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-teal">{totalPersonas}</p>
            <p className="text-xs text-gray-400">Personas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-400">{noReportaron}</p>
            <p className="text-xs text-gray-400">Sin reportar</p>
          </div>
        </div>
        {totalOfrenda > 0 && (
          <p className="text-sm text-center text-teal font-medium pt-1">
            Ofrenda total: ${totalOfrenda.toLocaleString()}
          </p>
        )}
      </div>

      {/* Lista */}
      {reportes.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">Nadie ha reportado aun esta semana.</p>
      ) : (
        <div className="space-y-3">
          {reportes.map(r => (
            <div key={r.id} className="card space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{r.perfiles?.nombre ?? r.perfiles?.email ?? 'Miembro'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="badge bg-primary-light text-primary">{r.personas_participaron} personas</span>
              </div>
              <div className="flex gap-2 flex-wrap pt-1">
                {r.hubo_ofrenda && (
                  <span className="badge bg-teal-light text-teal">
                    Ofrenda{r.monto_ofrenda ? `: $${r.monto_ofrenda}` : ''}
                  </span>
                )}
              </div>
              {r.nota && (
                <p className="text-xs text-gray-500 italic border-t border-gray-50 pt-2 mt-1">"{r.nota}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
