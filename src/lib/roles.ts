/**
 * Roles del sistema:
 *  - miembro         → solo accede al devocional
 *  - pastor_general  → acceso total (incluye datos económicos)
 *  - plan_de_vida    → acceso total (incluye datos económicos)
 *  - pastor_supervisor → todo excepto datos económicos
 *  - pastor_red      → solo reportes de su propia red asignada
 *  - admin / pastor  → aliases legacy, acceso total
 */

export const ROLES_ADMIN = [
  'admin', 'pastor',
  'pastor_general', 'plan_de_vida',
  'pastor_supervisor', 'pastor_red',
]

export const ROLES_VER_ECONOMICO = [
  'admin', 'pastor',
  'pastor_general',
]

export function esAdmin(rol: string) {
  return ROLES_ADMIN.includes(rol)
}

export function puedeVerEconomico(rol: string) {
  return ROLES_VER_ECONOMICO.includes(rol)
}

export function esPastorRed(rol: string) {
  return rol === 'pastor_red'
}

const DISPLAY: Record<string, string> = {
  miembro:           'Miembro',
  lider:             'Líder',
  admin:             'Administrador',
  pastor:            'Administrador',
  pastor_general:    'Pastor General',
  plan_de_vida:      'Plan de Vida',
  pastor_supervisor: 'Pastor Supervisor',
  pastor_red:        'Pastor de Red',
}

export function displayRol(rol: string | null | undefined): string {
  if (!rol) return 'Miembro'
  return DISPLAY[rol] ?? rol.charAt(0).toUpperCase() + rol.slice(1)
}

export const ROL_OPTIONS = [
  { value: 'miembro',           label: 'Miembro' },
  { value: 'pastor_general',    label: 'Pastor General' },
  { value: 'plan_de_vida',      label: 'Plan de Vida' },
  { value: 'pastor_supervisor', label: 'Pastor Supervisor' },
  { value: 'pastor_red',        label: 'Pastor de Red' },
] as const
