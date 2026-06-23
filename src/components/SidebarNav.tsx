'use client'
import { useState } from 'react'
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

// Admin, Pastor General, Plan de Vida — acceso total
const ITEMS_ADMIN: Item[] = [
  { href: '/admin', label: 'Resumen', icon: iconChart, match: (p, q) => p === '/admin' && !q.get('vista') && !q.get('preview_rol') },
  { href: '/admin?vista=nuevo', label: 'Publicar devocional', icon: iconPlus, match: (p, q) => p === '/admin' && q.get('vista') === 'nuevo' },
  { href: '/admin?vista=reportes', label: 'Reportes', icon: iconList, match: (p, q) => p === '/admin' && q.get('vista') === 'reportes' },
  { href: '/admin?vista=usuarios', label: 'Usuarios', icon: iconUsers, match: (p, q) => p === '/admin' && q.get('vista') === 'usuarios' },
  { href: '/historial', label: 'Mi historial', icon: iconClock, match: p => p.startsWith('/historial') },
]

// Pastor Supervisor — sin publicar ni usuarios
const ITEMS_SUPERVISOR: Item[] = [
  { href: '/admin', label: 'Resumen', icon: iconChart, match: (p, q) => p === '/admin' && !q.get('vista') },
  { href: '/admin?vista=reportes', label: 'Reportes', icon: iconList, match: (p, q) => p === '/admin' && q.get('vista') === 'reportes' },
  { href: '/historial', label: 'Mi historial', icon: iconClock, match: p => p.startsWith('/historial') },
]

// Pastor de Red — solo su red
const ITEMS_PASTOR_RED: Item[] = [
  { href: '/admin', label: 'Resumen', icon: iconChart, match: (p, q) => p === '/admin' && !q.get('vista') },
  { href: '/admin?vista=reportes', label: 'Reportes de mi red', icon: iconList, match: (p, q) => p === '/admin' && q.get('vista') === 'reportes' },
  { href: '/historial', label: 'Mi historial', icon: iconClock, match: p => p.startsWith('/historial') },
]

const PREVIEW_ROLES = [
  { rol: 'miembro', label: 'Miembro', href: '/devocional?preview_rol=miembro' },
  { rol: 'pastor_red', label: 'Pastor de Red', href: '/admin?preview_rol=pastor_red' },
  { rol: 'pastor_supervisor', label: 'Pastor Supervisor', href: '/admin?preview_rol=pastor_supervisor' },
  { rol: 'pastor_general', label: 'Pastor General', href: '/admin?preview_rol=pastor_general' },
]

function iniciales(nombre: string | undefined, email: string): string {
  const fuente = nombre?.trim() || email
  const partes = fuente.split(/\s+|@|\./).filter(Boolean)
  const letras = partes.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
  return letras || '?'
}

export default function SidebarNav({ user, rol, currentPath, currentSearch, onNavigate }: Props) {
  const supabase = createClient()
  const [previewAbierto, setPreviewAbierto] = useState(false)
  const rolesAdmin = ['admin', 'pastor', 'pastor_general', 'plan_de_vida', 'pastor_supervisor', 'pastor_red']
  const esAdmin = rolesAdmin.includes(rol)
  const esAccesoTotal = ['admin', 'pastor', 'pastor_general', 'plan_de_vida'].includes(rol)
  const params = new URLSearchParams(currentSearch)
  const previewActivo = params.get('preview_rol')

  function getItems() {
    if (!esAdmin) return ITEMS_MIEMBRO
    if (rol === 'pastor_red') return ITEMS_PASTOR_RED
    if (rol === 'pastor_supervisor') return ITEMS_SUPERVISOR
    return ITEMS_ADMIN
  }
  const items = getItems()

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-full w-full bg-white border-r border-gray-100">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <img
          src="/logo-casasvida.png.png"
          alt="Casas de Vida"
          className="w-32 h-auto object-contain"
        />
        <p className="text-[10px] font-bold tracking-widest uppercase mt-1.5" style={{ color: '#3B3B8E' }}>
          Sistema Vida
        </p>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                          ${activo
                            ? 'text-white font-semibold shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
              style={activo ? { background: 'linear-gradient(90deg, #3B3B8E, #F7941D)' } : {}}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </a>
          )
        })}

        {/* Vista previa como... — solo para roles con acceso total */}
        {esAccesoTotal && (
          <div>
            <button
              onClick={() => setPreviewAbierto(v => !v)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                ${previewActivo
                  ? 'text-white font-semibold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
              style={previewActivo ? { background: 'linear-gradient(90deg, #3B3B8E, #F7941D)' } : {}}
            >
              <span className="flex-shrink-0">{iconEye}</span>
              <span className="truncate flex-1 text-left">Vista previa como...</span>
              <span className="text-xs opacity-60">{previewAbierto ? '▲' : '▼'}</span>
            </button>
            {previewAbierto && (
              <div className="ml-4 mt-1 space-y-0.5">
                {PREVIEW_ROLES.map(item => {
                  const activo = previewActivo === item.rol
                  return (
                    <a
                      key={item.rol}
                      href={item.href}
                      onClick={() => onNavigate?.()}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors
                        ${activo
                          ? 'text-primary font-semibold bg-primary/5'
                          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activo ? 'bg-primary' : 'bg-gray-300'}`} />
                      {item.label}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Usuario + logout */}
      <div className="border-t border-gray-100 p-3 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #3B3B8E, #F7941D)' }}>
            {iniciales(user.nombre, user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.nombre ?? user.email}</p>
            <p className="text-xs text-gray-400">{displayRol(rol)}</p>
          </div>
        </div>
        <button
          onClick={cerrarSesion}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          {iconLogout}
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}
