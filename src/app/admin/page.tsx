import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { getMyRole } from '@/lib/auth/role'
import { esAdmin } from '@/lib/roles'

const ROLES_PREVIEW_VALIDOS = ['miembro', 'pastor_red', 'pastor_supervisor', 'pastor_general', 'plan_de_vida']

export default async function AdminPage({ searchParams }: { searchParams: { vista?: string; preview_rol?: string } }) {
  const vistaParam = searchParams?.vista
  const vista: 'resumen' | 'nuevo' | 'editar' | 'reportes' | 'usuarios' =
    vistaParam === 'nuevo' || vistaParam === 'editar' || vistaParam === 'reportes' || vistaParam === 'usuarios' ? vistaParam : 'resumen'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rolReal = await getMyRole(supabase, user.id)
  if (!esAdmin(rolReal)) redirect('/devocional')

  const previewRol = searchParams?.preview_rol && ROLES_PREVIEW_VALIDOS.includes(searchParams.preview_rol)
    ? searchParams.preview_rol
    : null
  const rol = previewRol ?? rolReal

  // Obtener red asignada del pastor (para pastor_red)
  const { data: miPerfil } = await supabase
    .from('perfiles')
    .select('red_asignada')
    .eq('id', user.id)
    .maybeSingle()
  const redAsignada = miPerfil?.red_asignada ?? null

  const { data: devocionalActivo } = await supabase
    .from('devocionales')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const inicioSemana = new Date()
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
  inicioSemana.setHours(0, 0, 0, 0)

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  // Pastor de red: solo reportes de su red
  const baseQuery = supabase
    .from('reportes')
    .select('*, perfiles(nombre, email)')
    .gte('created_at', inicioSemana.toISOString())
    .order('created_at', { ascending: false })

  const { data: reportesSemana } = rol === 'pastor_red' && redAsignada
    ? await baseQuery.eq('red', redAsignada)
    : await baseQuery

  const { data: reportesMes } = await supabase
    .from('reportes')
    .select('hubo_ofrenda, monto_ofrenda')
    .gte('created_at', inicioMes.toISOString())

  const ofrendaMes = (reportesMes ?? [])
    .filter(r => r.hubo_ofrenda)
    .reduce((s, r) => s + (r.monto_ofrenda ?? 0), 0)

  const miembrosQuery = supabase
    .from('perfiles')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true)
    .in('rol', ['miembro', 'lider'])

  const { count: totalMiembros } = rol === 'pastor_red' && redAsignada
    ? await miembrosQuery.eq('red_asignada', redAsignada)
    : await miembrosQuery

  // Miembros que NO han reportado el devocional activo
  let noReportaron: { id: string; nombre: string | null; email: string | null }[] = []
  if (devocionalActivo) {
    const { data: reportantes } = await supabase
      .from('reportes')
      .select('user_id')
      .eq('devocional_id', devocionalActivo.id)
    const idsReportaron = new Set((reportantes ?? []).map(r => r.user_id))

    const miembrosActivosQuery = supabase
      .from('perfiles')
      .select('id, nombre, email, rol')
      .eq('activo', true)
      .in('rol', ['miembro', 'lider'])

    const { data: miembrosActivos } = rol === 'pastor_red' && redAsignada
      ? await miembrosActivosQuery.eq('red_asignada', redAsignada)
      : await miembrosActivosQuery

    noReportaron = (miembrosActivos ?? [])
      .filter(m => !idsReportaron.has(m.id))
      .map(({ id, nombre, email }) => ({ id, nombre, email }))
  }

  return (
    <AdminDashboard
      user={{ id: user.id, nombre: user.user_metadata?.full_name, email: user.email! }}
      devocionalActivo={devocionalActivo}
      reportesSemana={reportesSemana ?? []}
      totalMiembros={totalMiembros ?? 0}
      ofrendaMes={ofrendaMes}
      noReportaron={noReportaron}
      rol={rol}
      redAsignada={redAsignada}
      vista={vista}
      previewRol={previewRol}
    />
  )
}
