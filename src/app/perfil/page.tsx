import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMyRole } from '@/lib/auth/role'
import EditarPerfilForm from '@/components/miembro/EditarPerfilForm'

export default async function PerfilPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rol = await getMyRole(supabase, user.id)

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, apellidos_familia, adultos, ninos, direccion, telefono')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <EditarPerfilForm
      user={{ id: user.id, email: user.email!, nombre: user.user_metadata?.full_name }}
      rol={rol}
      perfil={perfil}
    />
  )
}
