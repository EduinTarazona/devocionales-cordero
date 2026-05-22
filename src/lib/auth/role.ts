import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Obtiene el rol del usuario actual.
 * Prefiere el RPC SECURITY DEFINER get_my_role() para evitar
 * recursion en la RLS de perfiles. Si el RPC no existe (porque
 * todavia no se corrio la migracion), cae al query directo.
 */
export async function getMyRole(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_my_role')
  if (!error && typeof data === 'string' && data.length > 0) return data

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', userId)
    .maybeSingle()
  return perfil?.rol ?? 'miembro'
}
