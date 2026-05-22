import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMyRole } from '@/lib/auth/role'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      let target = next
      if (next === '/') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const rol = await getMyRole(supabase, user.id)
          target = rol === 'admin' || rol === 'pastor' ? '/admin' : '/devocional'
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${target}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${target}`)
      } else {
        return NextResponse.redirect(`${origin}${target}`)
      }
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    )
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`)
}
