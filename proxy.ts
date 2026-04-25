import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase-server";

const protectedPaths = ["/educator", "/student", "/setup", "/admin"];
const AUTH_DEBUG = process.env.AUTH_DEBUG === "true";

function authDebug(message: string, data?: Record<string, unknown>) {
  if (!AUTH_DEBUG) return;
  if (data) {
    console.log(`[AUTH_DEBUG] ${message}`, data);
    return;
  }
  console.log(`[AUTH_DEBUG] ${message}`);
}

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname.startsWith(path));
}

function copyCookies(from: NextResponse, to: NextResponse) {
  const setCookieHeaders = from.headers.getSetCookie?.() ?? [];

  authDebug("copyCookies", {
    fromSetCookieHeaderCount: setCookieHeaders.length,
    fromCookieNames: from.cookies.getAll().map((cookie) => cookie.name),
  });

  if (setCookieHeaders.length > 0) {
    setCookieHeaders.forEach((headerValue) => {
      to.headers.append("set-cookie", headerValue);
    });
    return;
  }

  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request);
  const pathname = request.nextUrl.pathname;
  const loginPath = "/";

  authDebug("middleware request", {
    pathname,
    host: request.headers.get("host"),
    origin: request.nextUrl.origin,
    requestCookieNames: request.cookies.getAll().map((cookie) => cookie.name),
  });

  // ✅ Use getUser for secure server-side validation
  const {
    data: { user },
  } = await supabase.auth.getUser();
  authDebug("middleware getUser result", {
    hasUser: Boolean(user),
    userId: user?.id,
    userRole: user?.user_metadata?.role,
    responseCookieNames: supabaseResponse.cookies.getAll().map((cookie) => cookie.name),
    responseSetCookieHeaderCount: supabaseResponse.headers.getSetCookie?.().length ?? 0,
  });
  const isProtected = isProtectedPath(pathname);
  // =========================
  // 🚫 NOT LOGGED IN
  // =========================
  if (!user) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = loginPath;

      authDebug("redirect unauthenticated protected route", {
        fromPathname: pathname,
        toPathname: url.pathname,
      });

      const redirect = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }

    return supabaseResponse;
  }

  // =========================
  // ✅ LOGGED IN
  // =========================
  const userRole = user.user_metadata?.role;

  // ⚠️ If role is undefined, DON'T aggressively redirect yet
  // This avoids refresh race condition
  if (!userRole) {
    if (!pathname.startsWith("/setup")) {
      const url = request.nextUrl.clone();
      url.pathname = "/setup";

      authDebug("redirect missing role", {
        fromPathname: pathname,
        toPathname: url.pathname,
      });

      const redirect = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }

    return supabaseResponse;
  }

  // =========================
  // 🔒 ROLE-BASED ACCESS
  // =========================
  if (userRole !== "ADMIN") {
    const isEducatorPath = pathname.startsWith("/educator");
    const isStudentPath = pathname.startsWith("/student");

    const invalidAccess =
      (isEducatorPath && userRole !== "EDUCATOR") ||
      (isStudentPath && userRole !== "STUDENT");

    if (invalidAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";

      authDebug("redirect unauthorized role access", {
        fromPathname: pathname,
        toPathname: url.pathname,
        userRole,
      });

      const redirect = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }

    // Prevent going back to setup after completion
    if (pathname.startsWith("/setup")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${userRole.toLowerCase()}/${user.id}/dashboard`;

      authDebug("redirect setup completed", {
        fromPathname: pathname,
        toPathname: url.pathname,
      });

      const redirect = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }
  }

  // =========================
  // 📍 ROOT ROUTES REDIRECT
  // =========================
  if (
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/educator" ||
    pathname === "/student" ||
    pathname === "/admin" ||
    pathname === "/educator/dashboard" ||
    pathname === "/student/dashboard" ||
    pathname === "/admin/dashboard"
  ) {
    const url = request.nextUrl.clone();

    if (userRole === "ADMIN") {
      url.pathname = `/admin/${user.id}/dashboard`;
    } else {
      url.pathname = `/${userRole.toLowerCase()}/${user.id}/dashboard`;
    }

    authDebug("redirect root/dashboard alias", {
      fromPathname: pathname,
      toPathname: url.pathname,
      userRole,
    });

    const redirect = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  // =========================
  // ✅ ALLOW REQUEST
  // =========================
  authDebug("allow request", {
    pathname,
    userId: user.id,
    userRole,
  });
  return supabaseResponse;
}

// =========================
// 🎯 MATCHER
// =========================
export const config = {
  matcher: [
    "/",
    "/setup/:path*",
    "/dashboard/:path*",
    "/educator/:path*",
    "/student/:path*",
    "/admin/:path*",
  ],
};