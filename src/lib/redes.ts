/**
 * Redes y departamentos de la iglesia.
 * El campo `red` de un reporte guarda el numero de red ('1'..'7')
 * o el nombre del departamento — una sola cosa por reporte.
 */

export const REDES = ['1', '2', '3', '4', '5', '6', '7']

export const DEPARTAMENTOS = [
  'Alabanza',
  'Danzas',
  'Diaconado',
  'Emprendedores',
  'Familia',
  'Hombres de valor',
  'Liberación y Sanidad',
  'Milagros',
  'R21',
]

export function displayRed(valor: string | null | undefined): string {
  if (!valor) return ''
  const v = valor.trim()
  return /^\d+$/.test(v) ? `Red ${v}` : v
}
