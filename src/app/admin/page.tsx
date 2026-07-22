import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { getMyRole } from '@/lib/auth/role'
import { esAdmin } from '@/lib/roles'

const ROLES_PREVIEW_VALIDOS = ['miembro', 'pastor_red', 'pastor_supervisor', 'pastor_general', 'plan_de_vida']

export default async function AdminPage({ searchParams }: { searchParams: { vista?: string; preview_rol?: string; preview_red?: string } }) {
  const vistaParam = searchParams?.vista
  const vista: 'resumen' | 'nuevo' | 'editar' | 'reportes' | 'usuarios' =
    vistaParam === 'nuevo' || vistaParam === 'editar' || vistaParam === 'reportes' || vistaParam === 'usuarios' ? vistaParam : 'resumen'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rolReal = await getMyRole(supabase, user.id)
  if (!esAdmin(rolReal)) redirect('/devocional')

  // Publicar, editar y usuarios: solo roles con acceso total
  const accesoTotal = ['admin', 'pastor', 'pastor_general', 'plan_de_vida'].includes(rolReal)
  if (!accesoTotal && (vista === 'nuevo' || vista === 'editar' || vista === 'usuarios')) {
    redirect('/admin')
  }

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
  let redAsignada = miPerfil?.red_asignada ?? null

  // En vista previa como pastor_red, se simula una red concreta (Red 1 por defecto)
  if (previewRol === 'pastor_red') {
    const previewRed = searchParams?.preview_red
    redAsignada = previewRed && /^[1-7]$/.test(previewRed) ? previewRed : '1'
  }

  // Puede haber un devocional activo por tipo; el familiar es el principal del panel
  const { data: devocionalesActivos } = await supabase
    .from('devocionales')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })
  const devocionalActivo = (devocionalesActivos ?? []).find(d => (d.tipo ?? 'familiar') === 'familiar')
    ?? (devocionalesActivos?.[0] ?? null)

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
    .select('hubo_ofrenda, monto_ofrenda, moneda_ofrenda')
    .gte('created_at', inicioMes.toISOString())

  const ofrendaMesPorMoneda: Record<string, number> = {}
  ;(reportesMes ?? []).filter(r => r.hubo_ofrenda && r.monto_ofrenda).forEach(r => {
    const moneda = r.moneda_ofrenda ?? 'USD'
    ofrendaMesPorMoneda[moneda] = (ofrendaMesPorMoneda[moneda] ?? 0) + r.monto_ofrenda
  })

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

  // Nuevos registros esta semana
  const { data: nuevosRegistros } = await supabase
    .from('perfiles')
    .select('id, nombre, email, created_at')
    .eq('perfil_completo', true)
    .gte('created_at', inicioSemana.toISOString())
    .order('created_at', { ascending: false })

  // ── Casas por red: todas las casas con su ultima red/depto conocido ──
  // La red no vive en el perfil: se toma del reporte mas reciente de cada casa.
  const { data: todasCasas } = await supabase
    .from('perfiles')
    .select('id, nombre, apellidos_familia, email')
    .eq('activo', true)
    .in('rol', ['miembro', 'lider'])
    .order('nombre')

  const { data: historialRed } = await supabase
    .from('reportes')
    .select('user_id, red, created_at')
    .not('red', 'is', null)
    .order('created_at', { ascending: false })
    .limit(2000)

  const redPorUsuario: Record<string, string> = {}
  for (const h of historialRed ?? []) {
    if (h.red && !redPorUsuario[h.user_id]) redPorUsuario[h.user_id] = h.red
  }

  const idsReportaronSemana = new Set((reportesSemana ?? []).map(r => r.user_id))
  let casas = (todasCasas ?? []).map(c => ({
    id: c.id,
    nombre: c.apellidos_familia ? `Flia. ${c.apellidos_familia}` : (c.nombre ?? c.email ?? 'Sin nombre'),
    red: redPorUsuario[c.id] ?? null,
    activa: idsReportaronSemana.has(c.id),
  }))
  if (rol === 'pastor_red' && redAsignada) {
    casas = casas.filter(c => c.red === redAsignada)
  }

  return (
    <AdminDashboard
      user={{ id: user.id, nombre: user.user_metadata?.full_name, email: user.email! }}
      devocionalActivo={devocionalActivo}
      reportesSemana={reportesSemana ?? []}
      totalMiembros={totalMiembros ?? 0}
      ofrendaMesPorMoneda={ofrendaMesPorMoneda}
      noReportaron={noReportaron}
      nuevosRegistros={nuevosRegistros ?? []}
      casas={casas}
      rol={rol}
      redAsignada={redAsignada}
      vista={vista}
      previewRol={previewRol}
    />
  )
}
