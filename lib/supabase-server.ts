import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_DEBUG = process.env.AUTH_DEBUG === 'true'

function authDebug(message: string, data?: Record<string, unknown>) {
  if (!AUTH_DEBUG) return
  if (data) {
    console.log(`[AUTH_DEBUG] ${message}`, data)
    return
  }
  console.log(`[AUTH_DEBUG] ${message}`)
}

export async function createServer() {
  const cookieStore = await cookies()
  authDebug('createServer initialized', {
    incomingCookieNames: cookieStore.getAll().map((cookie) => cookie.name),
  })

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          authDebug('createServer cookies.getAll', {
            cookieNames: allCookies.map((cookie) => cookie.name),
          })
          return allCookies
        },
        setAll(cookiesToSet) {
          authDebug('createServer cookies.setAll', {
            cookieNames: cookiesToSet.map((cookie) => cookie.name),
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  authDebug('createMiddlewareClient initialized', {
    pathname: request.nextUrl.pathname,
    host: request.headers.get('host'),
    origin: request.nextUrl.origin,
    incomingCookieNames: request.cookies.getAll().map((cookie) => cookie.name),
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = request.cookies.getAll()
          authDebug('createMiddlewareClient cookies.getAll', {
            cookieNames: allCookies.map((cookie) => cookie.name),
          })
          return allCookies
        },
        setAll(setCookies) {
          authDebug('createMiddlewareClient cookies.setAll', {
            cookieNames: setCookies.map((cookie) => cookie.name),
          })
          setCookies.forEach(({ name, value }) => request.cookies.set(name, value))
          
          supabaseResponse = NextResponse.next({
            request,
          })
          
          setCookies.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )

          authDebug('createMiddlewareClient response cookies updated', {
            responseCookieNames: supabaseResponse.cookies.getAll().map((cookie) => cookie.name),
          })
        },
      },
    }
  )

  return { supabase, supabaseResponse }
}