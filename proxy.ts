import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase-server";

const protectedPaths = ["/educator", "/student", "/setup", "/admin"];

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname.startsWith(path));
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request);
  const pathname = request.nextUrl.pathname;
  const loginPath = "/";

  // ✅ Use getUser for secure server-side validation
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isProtected = isProtectedPath(pathname);
  // =========================
  // 🚫 NOT LOGGED IN
  // =========================
  if (!user) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = loginPath;

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

      const redirect = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }

    // Prevent going back to setup after completion
    if (pathname.startsWith("/setup")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${userRole.toLowerCase()}/${user.id}/dashboard`;

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

    const redirect = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  // =========================
  // ✅ ALLOW REQUEST
  // =========================
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