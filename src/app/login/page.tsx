'use client'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function loginConGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F0FA' }}>

      {/* Franja superior con color */}
      <div className="h-56 flex flex-col items-center justify-end pb-16"
        style={{ background: 'linear-gradient(160deg, #2A2A6B, #3B3B8E)' }}
      />

      {/* Contenido centrado sobre la franja */}
      <div className="flex flex-col items-center px-4 -mt-16 pb-12">

        {/* Card con logo sobresaliendo arriba */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg px-8 pb-8 text-center">

          {/* Logo pegado al borde superior de la card */}
          <div className="flex justify-center -mt-14 mb-5">
            <div className="w-28 h-28 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2.5 border border-gray-100">
              <img
                src="/Logo CasasVida_page-0001.jpg"
                alt="Casas de Vida"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          <h1 className="text-xl font-extrabold text-gray-900">Sistema Vida</h1>
          <p className="text-xs text-gray-400 mt-2 mb-8 leading-relaxed">
            Ingresa con tu cuenta de Gmail para acceder a los devocionales
          </p>

          <button
            onClick={loginConGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white rounded-xl py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <p className="text-xs text-gray-300 text-center mt-5">Solo miembros registrados</p>
        </div>
      </div>
    </div>
  )

}
