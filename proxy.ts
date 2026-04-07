import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase-server";

const protectedPaths = ["/dashboard", "/educator", "/student", "/setup"];

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname.startsWith(path));
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

export async function proxy(request: NextRequest) {
  let { supabase, supabaseResponse } = createMiddlewareClient(request);
  const pathname = request.nextUrl.pathname;

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = isProtectedPath(pathname);

  // 1. Not logged in → block protected routes
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirect = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }
  // If no user and not protected → continue early
  if (!user) {
    return supabaseResponse;
  }

  // 1. Get role instantly from the user's auth metadata (Fast, 0 database queries!)
  const userRole = user.user_metadata?.role;

  // 2. Role-based restrictions
  // Force users without a role to complete setup (if they aren't already there)
  if (isProtected && pathname !== "/setup" && !userRole) {
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    const redirect = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  // Role-based restrictions (skip for admin)
  if (userRole && userRole !== "ADMIN") {
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

    // Prevent reversing back to setup if already fully set up
    if (pathname.startsWith("/setup")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${userRole.toLowerCase()}/dashboard`;
      const redirect = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }
  }

  // 3. Redirect logged-in users from homepage
  if (pathname === "/" || pathname === "/dashboard") {
    const url = request.nextUrl.clone();
    url.pathname = userRole
      ? `/${userRole.toLowerCase()}/dashboard`
      : "/setup";

    const redirect = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  // Continue with updated cookies
  return supabaseResponse;
}

// Also add the protected paths here with this pattern
export const config = {
  matcher: [
    "/",
    "/setup/:path*",
    "/dashboard/:path*",
    "/educator/:path*",
    "/student/:path*",
  ],
};