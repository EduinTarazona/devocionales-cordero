'use client'
import { createClient } from '@/lib/supabase/client'
import { displayRol } from '@/lib/roles'
import type { ReactNode } from 'react'

type Item = {
  href: string
  label: string
  icon: ReactNode
  match: (p: string, q: URLSearchParams) => boolean
}

type Props = {
  user: { nombre?: string; email: string }
  rol: string
  currentPath: string
  currentSearch: string
  onNavigate?: () => void
}

const iconBook = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const iconChart = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
const iconPlus = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const iconList = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)
const iconUsers = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const iconEye = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const iconClock = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const iconLogout = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const ITEMS_MIEMBRO: Item[] = [
  { href: '/devocional', label: 'Devocional', icon: iconBook, match: p => p === '/devocional' },
  { href: '/historial', label: 'Mi historial', icon: iconClock, match: p => p.startsWith('/historial') },
]

const ITEMS_ADMIN: Item[] = [
  { href: '/admin', label: 'Resumen', icon: iconChart, match: (p, q) => p === '/admin' && !q.get('vista') },
  { href: '/admin?vista=nuevo', label: 'Publicar devocional', icon: iconPlus, match: (p, q) => p === '/admin' && q.get('vista') === 'nuevo' },
  { href: '/admin?vista=reportes', label: 'Reportes', icon: iconList, match: (p, q) => p === '/admin' && q.get('vista') === 'reportes' },
  { href: '/admin?vista=usuarios', label: 'Usuarios', icon: iconUsers, match: (p, q) => p === '/admin' && q.get('vista') === 'usuarios' },
  { href: '/devocional', label: 'Ver como miembro', icon: iconEye, match: p => p === '/devocional' },
  { href: '/historial', label: 'Mi historial', icon: iconClock, match: p => p.startsWith('/historial') },
]

function iniciales(nombre: string | undefined, email: string): string {
  const fuente = nombre?.trim() || email
  const partes = fuente.split(/\s+|@|\./).filter(Boolean)
  const letras = partes.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
  return letras || '?'
}

export default function SidebarNav({ user, rol, currentPath, currentSearch, onNavigate }: Props) {
  const supabase = createClient()
  const esAdmin = rol === 'admin' || rol === 'pastor'
  const items = esAdmin ? ITEMS_ADMIN : ITEMS_MIEMBRO
  const params = new URLSearchParams(currentSearch)

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-full bg-primary text-white w-full">

      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 3v18" />
            <path d="M6 9h12" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight">Centro Cristiano</p>
          <p className="text-xs text-white/60 leading-tight">Cordero · Devocionales</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map(item => {
          const activo = item.match(currentPath, params)
          return (
            <a
              key={item.href + item.label}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                          ${activo
                            ? 'bg-white text-primary font-semibold shadow-sm'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </a>
          )
        })}
      </nav>

      {/* Usuario + logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {iniciales(user.nombre, user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.nombre ?? user.email}</p>
            <p className="text-xs text-white/60">{displayRol(rol)}</p>
          </div>
        </div>
        <button
          onClick={cerrarSesion}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white transition-colors"
        >
          {iconLogout}
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}
