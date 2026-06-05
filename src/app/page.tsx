import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { esAdmin } from '@/lib/roles'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('perfil_completo, rol')
    .eq('id', user.id)
    .maybeSingle()

  if (!perfil?.perfil_completo) redirect('/registro')

  const rol = perfil?.rol ?? 'miembro'
  if (esAdmin(rol)) redirect('/admin')
  redirect('/devocional')
}
