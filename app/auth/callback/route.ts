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

      // Determine base URL
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const baseUrl = isLocalEnv
        ? origin
        : forwardedHost
          ? `https://${forwardedHost}`
          : origin

      if (user) {
        const role = user.user_metadata?.role?.toLowerCase();

        // Has profile with role → send to role dashboard
        return NextResponse.redirect(`${baseUrl}/${role}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}