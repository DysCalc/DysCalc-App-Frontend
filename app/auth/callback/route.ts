import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase-server'

const AUTH_DEBUG = process.env.AUTH_DEBUG === 'true'

function authDebug(message: string, data?: Record<string, unknown>) {
  if (!AUTH_DEBUG) return
  if (data) {
    console.log(`[AUTH_DEBUG] ${message}`, data)
    return
  }
  console.log(`[AUTH_DEBUG] ${message}`)
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  authDebug('callback request received', {
    origin,
    hasCode: Boolean(code),
    next,
  })

  if (code) {
    const supabaseServer = await createServer()

    const { error } = await supabaseServer.auth.exchangeCodeForSession(code)
    authDebug('exchangeCodeForSession completed', {
      hasError: Boolean(error),
      errorMessage: error?.message,
    })

    if (error) {
      console.error('Exchange Code Error:', error.message)
    }

    if (!error) {
      // Get the user after exchanging the code
      const { data: { user }, error: userError } = await supabaseServer.auth.getUser()
      authDebug('callback getUser result', {
        hasUser: Boolean(user),
        userId: user?.id,
        userRole: user?.user_metadata?.role,
        userError: userError?.message,
      })

      console.log('User fetched after exchange:', user?.id)
      if (userError) {
        console.error('getUser Error:', userError.message)
      }

      // Always redirect to the current request origin to avoid cross-domain cookie issues.
      const baseUrl = origin

      if (user) {
        const role = user.user_metadata?.role?.toLowerCase();

        // If a specific next path is provided, use it
        if (next) {
          authDebug('callback redirecting to next', { next, baseUrl })
          return NextResponse.redirect(`${baseUrl}${next.startsWith('/') ? '' : '/'}${next}`)
        }

        // No role → send to setup page
        if (!role) {
          authDebug('callback redirecting to setup', { baseUrl })
          return NextResponse.redirect(`${baseUrl}/setup`)
        }

        authDebug('callback redirecting to dashboard', { role, userId: user.id, baseUrl })
        return NextResponse.redirect(`${baseUrl}/${role}/${user.id}/dashboard`)
      }
    }
  }

  // Fallback for Implicit Flow (Admin Invites):
  // Since Admin Invites cannot use PKCE, they send a hash fragment (#access_token).
  // The server cannot see the hash, so 'code' will be null.
  // We redirect to an UNPROTECTED client-side page that processes the hash before middleware interferes.
  if (!code && next) {
    authDebug('callback implicit flow redirect', { next, origin })
    return NextResponse.redirect(`${origin}/auth/verify-implicit?next=${encodeURIComponent(next)}`)
  }

  authDebug('callback redirecting to auth-code-error', { origin })
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}