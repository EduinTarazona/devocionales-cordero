import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DevocionalView from '@/components/miembro/DevocionalView'
import { getMyRole } from '@/lib/auth/role'

const ROLES_PREVIEW_VALIDOS = ['miembro', 'pastor_red', 'pastor_supervisor', 'pastor_general', 'plan_de_vida']

export default async function DevocionalPage({ searchParams }: { searchParams?: { preview_rol?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rolReal = await getMyRole(supabase, user.id)
  const previewRol = searchParams?.preview_rol && ROLES_PREVIEW_VALIDOS.includes(searchParams.preview_rol)
    ? searchParams.preview_rol
    : null
  const rol = previewRol ?? rolReal

  // Puede haber un devocional activo por cada tipo (familiar/grupal/empresarial)
  const { data: activos } = await supabase
    .from('devocionales')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  const devocionalesPorTipo: Record<string, any> = {}
  for (const d of activos ?? []) {
    const t = d.tipo ?? 'familiar'
    if (!devocionalesPorTipo[t]) devocionalesPorTipo[t] = d
  }
  // El familiar es el principal; si no hay, se toma el mas reciente
  const devocional = devocionalesPorTipo['familiar'] ?? (activos?.[0] ?? null)

  const idsActivos = (activos ?? []).map(d => d.id)
  const { data: reportes } = idsActivos.length > 0
    ? await supabase
        .from('reportes')
        .select('id, adultos, ninos, hubo_ofrenda, monto_ofrenda, moneda_ofrenda, tipo, nombre_grupo, nombre_empresa')
        .in('devocional_id', idsActivos)
        .eq('user_id', user.id)
    : { data: [] }

  const reportesPorTipo: Record<string, any> = {}
  for (const r of reportes ?? []) {
    reportesPorTipo[r.tipo ?? 'familiar'] = r
  }

  return (
    <DevocionalView
      user={{ id: user.id, email: user.email!, nombre: user.user_metadata?.full_name }}
      rol={rol}
      devocional={devocional}
      devocionalesPorTipo={devocionalesPorTipo}
      reportesPorTipo={reportesPorTipo}
      previewRol={previewRol}
    />
  )
}
