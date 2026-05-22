import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DevocionalView from '@/components/miembro/DevocionalView'
import { getMyRole } from '@/lib/auth/role'

export default async function DevocionalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rol = await getMyRole(supabase, user.id)

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
        .select('id')
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
    />
  )
}
