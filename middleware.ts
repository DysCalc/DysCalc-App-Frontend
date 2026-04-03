import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";


export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(setCookies) {
                    // Forward cookie writes to both the request (for downstream server
                    // components in this same request) and the response (for the browser).
                    setCookies.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );

                    supabaseResponse = NextResponse.next({
                        request,
                    });

                    setCookies.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // List here all protected paths
    const protectedPaths: string[] = [
        "/dashboard",
    ]

    const isProtected = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtected && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";

        // 1. Create the new redirect response
        const redirectResponse = NextResponse.redirect(url);
        
        // 2. Copy ALL cookies from the supabaseResponse over to the redirectResponse
        // This ensures that if getUser() cleared dead tokens, the browser actually deletes them!
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value);
        });

        // 3. Return the redirect
        return redirectResponse;
    }

    // Return the supabaseResponse, not a new NextResponse.next(). 
    // As the supabaseResponse contains the updated cookies from any token refresh.
    return supabaseResponse;
}

// Also add the protected paths here with this pattern
export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};