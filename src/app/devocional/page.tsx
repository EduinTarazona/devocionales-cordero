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

  const { data: devocional } = await supabase
    .from('devocionales')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: reporte } = devocional
    ? await supabase
        .from('reportes')
        .select('id, adultos, ninos, hubo_ofrenda, monto_ofrenda, moneda_ofrenda')
        .eq('devocional_id', devocional.id)
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }

  return (
    <DevocionalView
      user={{ id: user.id, email: user.email!, nombre: user.user_metadata?.full_name }}
      rol={rol}
      devocional={devocional}
      yaReporto={!!reporte}
      miReporte={reporte ?? null}
      previewRol={previewRol}
    />
  )
}
