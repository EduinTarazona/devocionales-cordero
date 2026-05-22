/**
 * Mapea el rol interno (lo que esta en la BD) al nombre visible
 * en la UI. La BD sigue usando 'pastor' / 'admin' por compatibilidad
 * con las politicas RLS existentes.
 */
const DISPLAY: Record<string, string> = {
  miembro: 'Miembro',
  lider: 'Lider',
  admin: 'Administrador',
  pastor: 'Administrador',
}

export function displayRol(rol: string | null | undefined): string {
  if (!rol) return 'Miembro'
  return DISPLAY[rol] ?? rol.charAt(0).toUpperCase() + rol.slice(1)
}

/**
 * Opciones que se muestran en los selects de cambio de rol.
 * value = lo que se guarda en la BD; label = lo que ve el usuario.
 */
export const ROL_OPTIONS = [
  { value: 'miembro', label: 'Miembro' },
  { value: 'lider', label: 'Lider' },
  { value: 'admin', label: 'Administrador' },
] as const
