import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMyRole } from '@/lib/auth/role'
import DirectorioView from '@/components/admin/DirectorioView'

const ROLES_DIRECTORIO = ['admin', 'pastor', 'pastor_general', 'plan_de_vida']

export default async function DirectorioPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rol = await getMyRole(supabase, user.id)
  if (!ROLES_DIRECTORIO.includes(rol)) redirect('/admin')

  const { data: casas } = await supabase
    .from('perfiles')
    .select('id, nombre, apellidos_familia, direccion, telefono, adultos, ninos, red_asignada, rol, email')
    .in('rol', ['miembro', 'lider'])
    .order('apellidos_familia', { ascending: true })

  return (
    <DirectorioView
      user={{ id: user.id, nombre: user.user_metadata?.full_name, email: user.email! }}
      rol={rol}
      casas={casas ?? []}
    />
  )
}
