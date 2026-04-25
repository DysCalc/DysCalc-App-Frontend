import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabaseServer = await createServer()

    const { error } = await supabaseServer.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Exchange Code Error:', error.message)
    }

    if (!error) {
      // Get the user after exchanging the code
      const { data: { user }, error: userError } = await supabaseServer.auth.getUser()

      console.log('User fetched after exchange:', user?.id)
      if (userError) {
        console.error('getUser Error:', userError.message)
      }

      // Always redirect to the current request origin to avoid cross-domain cookie issues.
      const baseUrl = origin

      if (user) {
        const role = user.user_metadata?.role?.toLowerCase();
        const next = searchParams.get('next')

        // If a specific next path is provided, use it
        if (next) {
          return NextResponse.redirect(`${baseUrl}${next.startsWith('/') ? '' : '/'}${next}`)
        }

        // No role → send to setup page
        if (!role) {
          return NextResponse.redirect(`${baseUrl}/setup`)
        }

        return NextResponse.redirect(`${baseUrl}/${role}/${user.id}/dashboard`)
      }
    }
  }

  // Fallback for Implicit Flow (Admin Invites):
  // Since Admin Invites cannot use PKCE, they send a hash fragment (#access_token).
  // The server cannot see the hash, so 'code' will be null.
  // We redirect to an UNPROTECTED client-side page that processes the hash before middleware interferes.
  const next = searchParams.get('next');
  if (!code && next) {
    return NextResponse.redirect(`${origin}/auth/verify-implicit?next=${encodeURIComponent(next)}`)
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}