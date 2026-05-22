import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMyRole } from '@/lib/auth/role'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const rol = await getMyRole(supabase, user.id)
  if (rol === 'admin' || rol === 'pastor') redirect('/admin')
  redirect('/devocional')
}
