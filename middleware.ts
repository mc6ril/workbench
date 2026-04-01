import { type NextRequest, NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { requireNonEmptyEnv } from "@/shared/errors/programmingError";
import {
  isSupportedLocale,
  localeCookieMaxAgeSeconds,
  localeCookieName,
  requestLocaleHeaderName,
  resolveLocale,
} from "@/shared/i18n/config";
import { getMarketingLocaleFromPathname } from "@/shared/i18n/marketingPaths";
import {
  buildAuthCallbackPath,
  getAuthCodeRedirectTarget,
  sanitizeInternalRedirectPath,
} from "@/shared/utils/authRedirect";
import { isProtectedRoute } from "@/shared/utils/routes";

/**
 * Create Supabase client for Edge Runtime (middleware).
 * Uses @supabase/ssr to handle sessions via cookies.
 * Forwards `forwardHeaders` on every `NextResponse.next` so locale injection is preserved.
 */
const createSupabaseClientForMiddleware = (
  request: NextRequest,
  forwardHeaders: Headers
) => {
  const supabaseUrl = requireNonEmptyEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Missing NEXT_PUBLIC_SUPABASE_URL for Supabase middleware client"
  );
  const supabasePublishableKey = requireNonEmptyEnv(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY for Supabase middleware client"
  );

  let supabaseResponse = NextResponse.next({
    request: {
      headers: forwardHeaders,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
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
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request: {
            headers: forwardHeaders,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response: supabaseResponse };
};

const appendLocaleResponseCookies = (
  response: NextResponse,
  pathname: string
): NextResponse => {
  const fromPath = getMarketingLocaleFromPathname(pathname);
  if (fromPath && isSupportedLocale(fromPath)) {
    response.cookies.set(localeCookieName, fromPath, {
      path: "/",
      sameSite: "lax",
      maxAge: localeCookieMaxAgeSeconds,
    });
  }

  return response;
};

/**
 * Next.js middleware for route optimization (UX redirects).
 *
 * IMPORTANT: This is NOT the source of truth for security.
 * - Security is enforced by AuthLayout and ProjectLayout (server components)
 * - RLS policies at the database level are the ultimate source of truth
 *
 * This middleware provides:
 * - Locale-prefixed marketing URLs and `x-next-locale` for Server Components
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

  // Canonical public URLs are `/{locale}`; files live under `/marketing/{locale}` (see next.config rewrites).
  if (pathname === "/marketing" || pathname.startsWith("/marketing/")) {
    const suffix = pathname === "/marketing" ? "/" : pathname.slice("/marketing".length);
    return NextResponse.redirect(new URL(suffix, request.url));
  }

  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  const acceptLanguage = request.headers.get("accept-language");
  const resolvedFromPreferences = resolveLocale({
    cookieLocale,
    acceptLanguage,
  });

  // Legacy marketing URLs without locale prefix → locale-prefixed URLs
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(`/${resolvedFromPreferences}`, request.url)
    );
  }

  if (pathname === "/pricing" || pathname === "/legal") {
    return NextResponse.redirect(
      new URL(`/${resolvedFromPreferences}${pathname}`, request.url)
    );
  }

  const pathLocale = getMarketingLocaleFromPathname(pathname);
  const resolvedLocale = pathLocale ?? resolvedFromPreferences;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(requestLocaleHeaderName, resolvedLocale);

  const isAuthPage =
    pathname === "/auth/signin" || pathname === "/auth/signup";
  const isProtected = isProtectedRoute(pathname);
  const localeHomePath = pathLocale ? `/${pathLocale}` : null;
  const isMarketingHome =
    localeHomePath !== null &&
    (pathname === localeHomePath || pathname === `${localeHomePath}/`);

  if (isMarketingHome) {
    const code = request.nextUrl.searchParams.get("code");
    const type = request.nextUrl.searchParams.get("type");
    const next = request.nextUrl.searchParams.get("next");

    if (code) {
      const nextPath = sanitizeInternalRedirectPath(
        next,
        getAuthCodeRedirectTarget(type)
      );

      return NextResponse.redirect(
        new URL(
          buildAuthCallbackPath({
            code,
            nextPath,
            fallbackPath: getAuthCodeRedirectTarget(type),
          }),
          request.url
        )
      );
    }
  }

  if (!isAuthPage && !isProtected && !isMarketingHome) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return appendLocaleResponseCookies(response, pathname);
  }

  try {
    const { supabase, response } = createSupabaseClientForMiddleware(
      request,
      requestHeaders
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && (isAuthPage || isMarketingHome)) {
      return NextResponse.redirect(new URL(PAGE_ROUTES.WORKSPACE, request.url));
    }

    if (isProtected) {
      if (error || !user) {
        const signInUrl = new URL(AUTH_PAGE_ROUTES.SIGNIN, request.url);
        signInUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(signInUrl);
      }

      if (!user.email_confirmed_at) {
        const signInUrl = new URL(AUTH_PAGE_ROUTES.SIGNIN, request.url);
        signInUrl.searchParams.set("unverified", "true");
        return NextResponse.redirect(signInUrl);
      }
    }

    return appendLocaleResponseCookies(response, pathname);
  } catch (error) {
    console.error("[Middleware] Authentication error:", error);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return appendLocaleResponseCookies(response, pathname);
  }
};

/**
 * Middleware configuration.
 * Matches request paths except static assets and API (see matcher).
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
