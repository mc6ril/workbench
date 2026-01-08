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
const createSupabaseClientForMiddleware = (request: NextRequest) => {
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
};

/**
 * Next.js middleware for route optimization (UX redirects).
 *
 * IMPORTANT: This is NOT the source of truth for security.
 * - Security is enforced by AuthLayout and ProjectLayout (server components)
 * - RLS policies at the database level are the ultimate source of truth
 *
 * This middleware provides:
 * - UX optimization: early redirects for better user experience
 * - Route filtering: prevents loading unnecessary pages
 * - Email verification checks: redirects unverified users
 *
 * On error, fails open (allows access) - layouts and RLS will still protect.
 */
export const middleware = async (
  request: NextRequest
): Promise<NextResponse> => {
  const { pathname } = request.nextUrl;

  // Check if this is an auth page (signin/signup)
  const isAuthPage = pathname === "/auth/signin" || pathname === "/auth/signup";

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
      return NextResponse.redirect(new URL("/workspace", request.url));
    }

    // If this is a protected route and user is not authenticated, redirect to signin
    if (isProtectedRoute(pathname)) {
      if (error || !session) {
        const signInUrl = new URL("/auth/signin", request.url);
        // Preserve the original URL as a redirect parameter
        signInUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Check if user email is verified (email_confirmed_at must be set)
      // Use getUser() to get user details including email_confirmed_at
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !user.email_confirmed_at) {
        // User is authenticated but email not verified, redirect to signin with message
        const signInUrl = new URL("/auth/signin", request.url);
        signInUrl.searchParams.set("unverified", "true");
        return NextResponse.redirect(signInUrl);
      }
    }

    // Allow access for all other cases
    return response;
  } catch (error) {
    // On error, fail open (allow access) to prevent lockout
    // This is safe because:
    // 1. AuthLayout will check authentication again (server component)
    // 2. ProjectLayout will check project access via RLS (server component)
    // 3. RLS policies at database level are the ultimate source of truth
    // Middleware is optimization only, not security
    console.error("[Middleware] Authentication error:", error);
    return NextResponse.next();
  }
};

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
