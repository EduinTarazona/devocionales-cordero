'use client'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function loginConGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Ícono + nombre */}
        <div className="flex flex-col items-center mb-8">
          {/* Letra C naranja con casita navy */}
          <div className="mb-4">
            <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* C naranja — arco desde arriba-derecha hasta abajo-derecha, abierta a la derecha */}
              <path d="M 59 17 A 30 30 0 1 0 59 59" stroke="#F7941D" strokeWidth="10" strokeLinecap="round" fill="none"/>
              {/* Chimenea (antes del techo para que quede detrás) */}
              <rect x="44" y="25" width="5" height="11" rx="1" fill="#3B3B8E"/>
              {/* Techo */}
              <polygon points="24,38 38,22 52,38" fill="#3B3B8E"/>
              {/* Cuerpo */}
              <rect x="27" y="38" width="22" height="16" rx="1" fill="#3B3B8E"/>
              {/* Ventana izquierda */}
              <rect x="29" y="40" width="6" height="5" rx="0.5" fill="white" fillOpacity="0.85"/>
              {/* Puerta central */}
              <rect x="35" y="44" width="7" height="10" rx="1" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>
          {/* Nombre */}
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#3B3B8E' }}>
            Sistema <span style={{ color: '#F7941D' }}>Vida</span>
          </h1>
          <p className="text-[11px] text-gray-400 tracking-widest uppercase mt-1">Casas de Vida</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
          <button
            onClick={loginConGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, #3B3B8E, #F7941D)' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#fff" fillOpacity=".9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" fillOpacity=".9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" fillOpacity=".9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#fff" fillOpacity=".9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>
          <p className="text-center text-xs text-gray-300 mt-3">Solo miembros registrados</p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 mt-6">
          © {new Date().getFullYear()} Casas de Vida · Sistema Vida
        </p>

      </div>
    </div>
  )
}
