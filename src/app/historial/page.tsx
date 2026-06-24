import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistorialView from '@/components/miembro/HistorialView'
import { getMyRole } from '@/lib/auth/role'

export default async function HistorialPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rol = await getMyRole(supabase, user.id)

  const { data: reportes } = await supabase
    .from('reportes')
    .select('id, adultos, ninos, personas_participaron, hubo_ofrenda, monto_ofrenda, moneda_ofrenda, nota, tipo, nombre_grupo, nombre_empresa, created_at, devocionales(id, titulo, pasaje, referencia)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <HistorialView
      user={{ id: user.id, email: user.email!, nombre: user.user_metadata?.full_name }}
      rol={rol}
      reportes={reportes ?? []}
    />
  )
}
