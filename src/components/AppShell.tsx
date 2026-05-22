'use client'
import { useEffect, useState, type ReactNode } from 'react'
import SidebarNav from './SidebarNav'

type Props = {
  user: { id?: string; nombre?: string; email: string }
  rol: string
  currentPath: string
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export default function AppShell({ user, rol, currentPath, title, subtitle, actions, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setSearch(window.location.search)
    function onPop() { setSearch(window.location.search) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar persistente — desktop */}
      <aside className="hidden md:flex md:w-60 lg:w-64 flex-shrink-0 sticky top-0 h-screen z-30">
        <SidebarNav user={user} rol={rol} currentPath={currentPath} currentSearch={search} />
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw] z-50 shadow-2xl
                    transform transition-transform duration-200 ease-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!mobileOpen}
      >
        <SidebarNav
          user={user}
          rol={rol}
          currentPath={currentPath}
          currentSearch={search}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Area de contenido */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            {subtitle && <p className="text-xs text-gray-400 uppercase tracking-wide">{subtitle}</p>}
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
