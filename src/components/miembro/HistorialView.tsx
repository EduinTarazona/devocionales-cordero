'use client'
import AppShell from '../AppShell'

type Reporte = {
  id: string
  personas_participaron: number
  hubo_ofrenda: boolean
  monto_ofrenda: number | null
  nota: string | null
  created_at: string
  devocionales: {
    id: string
    titulo: string
    tipo: string
    pasaje: string | null
    referencia: string | null
  } | null
}

type Props = {
  user: { id: string; email: string; nombre?: string }
  rol: string
  reportes: Reporte[]
}

export default function HistorialView({ user, rol, reportes }: Props) {
  const totalPersonas = reportes.reduce((s, r) => s + (r.personas_participaron ?? 0), 0)
  const totalOfrenda = reportes.filter(r => r.hubo_ofrenda).reduce((s, r) => s + (r.monto_ofrenda ?? 0), 0)

  return (
    <AppShell user={user} rol={rol} currentPath="/historial" title="Mi historial" subtitle="Devocionales completados">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-5">

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="card py-3">
            <p className="text-2xl font-bold text-primary">{reportes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Devocionales</p>
          </div>
          <div className="card py-3">
            <p className="text-2xl font-bold text-teal">{totalPersonas}</p>
            <p className="text-xs text-gray-500 mt-1">Personas</p>
          </div>
          <div className="card py-3">
            <p className="text-2xl font-bold text-orange-500">${totalOfrenda.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Ofrenda</p>
          </div>
        </div>

        {reportes.length === 0 ? (
          <div className="card text-center space-y-2 py-8">
            <div className="text-4xl">📭</div>
            <p className="font-semibold text-gray-700">Aun no has reportado ningun devocional</p>
            <p className="text-sm text-gray-500">Cuando reportes tus participaciones apareceran aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportes.map(r => (
              <div key={r.id} className="card space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.devocionales?.titulo ?? 'Devocional eliminado'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="badge bg-primary-light text-primary">{r.personas_participaron} personas</span>
                </div>
                {r.devocionales?.pasaje && (
                  <p className="text-xs text-primary italic">"{r.devocionales.pasaje}"</p>
                )}
                <div className="flex gap-2 flex-wrap pt-1">
                  {r.hubo_ofrenda && (
                    <span className="badge bg-teal-light text-teal">
                      Ofrenda{r.monto_ofrenda ? `: $${r.monto_ofrenda.toLocaleString()}` : ''}
                    </span>
                  )}
                  {r.devocionales?.tipo && (
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{r.devocionales.tipo}</span>
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
    </AppShell>
  )
}
