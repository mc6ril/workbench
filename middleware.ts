import { type NextRequest, NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

import { isProtectedRoute } from "@/shared/utils/routes";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

/**
 * Create Supabase client for Edge Runtime (middleware).
 * Uses @supabase/ssr to handle sessions via cookies.
 */
function createSupabaseClientForMiddleware(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing required environment variables for Supabase client"
    );
  }

  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: CookieOptions;
        }>
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  return { supabase, response: supabaseResponse };
}

/**
 * Next.js middleware for route protection.
 * Checks authentication for protected routes and redirects unauthenticated users.
 * Also redirects authenticated users away from auth pages (signin/signup).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an auth page (signin/signup)
  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  try {
    // Create Supabase client for Edge Runtime with cookie handling
    const { supabase, response } = createSupabaseClientForMiddleware(request);

    // Check session using Supabase Auth (reads from cookies)
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // If user is authenticated and trying to access auth pages, redirect to workspace
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL("/myworkspace", request.url));
    }

    // If this is a protected route and user is not authenticated, redirect to signin
    if (isProtectedRoute(pathname)) {
      if (error || !session) {
        const signInUrl = new URL("/signin", request.url);
        // Preserve the original URL as a redirect parameter
        signInUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Allow access for all other cases
    return response;
  } catch (error) {
    // On error, fail open (allow access) to prevent lockout
    // RLS policies will still protect data at database level
    console.error("[Middleware] Authentication error:", error);
    return NextResponse.next();
  }
}

/**
 * Middleware configuration.
 * Matches only protected routes to avoid unnecessary processing.
 * The middleware function itself will skip public routes, but we optimize
 * the matcher to reduce middleware execution for static assets.
 */
export const config = {
  matcher: [
    /*
     * Match request paths except:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files (images, etc.)
     * - public folder files
     *
     * Note: Public routes (/, /signin, /signup) are matched but will be
     * skipped by the middleware logic using isProtectedRoute().
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
