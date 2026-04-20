import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { requireNonEmptyEnv } from "@/shared/errors/programmingError";
import {
  defaultLocale,
  localeCookieMaxAgeSeconds,
  localeCookieName,
} from "@/shared/i18n/config";
import {
  getMarketingLocaleFromPathname,
  getResolvedMarketingLocaleFromPathname,
  isDefaultLocaleMarketingPathname,
  localizeMarketingPathname,
} from "@/shared/i18n/marketingPaths";
import { routing } from "@/shared/i18n/routing";
import { resolveRuntimeLocale } from "@/shared/i18n/runtimeLocale";
import {
  buildAuthCallbackPath,
  getAuthCodeRedirectTarget,
  sanitizeInternalRedirectPath,
} from "@/shared/utils/authRedirect";
import {
  isMarketingPublicRoute,
  isProtectedRoute,
} from "@/shared/utils/routes";
import { hasSupabaseAuthCookie } from "@/shared/utils/supabaseAuthCookies";

const NEXT_INTL_LOCALE_HEADER_NAME = "X-NEXT-INTL-LOCALE";
const INTERNAL_MARKETING_ROOT = "/marketing";
const handleMarketingLocale = createMiddleware(routing);

const setLocaleCookie = (
  response: NextResponse,
  locale: string
): NextResponse => {
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: localeCookieMaxAgeSeconds,
  });

  return response;
};

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
  pathname: string,
  currentCookieLocale?: string
): NextResponse => {
  const resolvedMarketingLocale =
    getResolvedMarketingLocaleFromPathname(pathname);
  if (
    resolvedMarketingLocale &&
    resolvedMarketingLocale !== currentCookieLocale
  ) {
    return setLocaleCookie(response, resolvedMarketingLocale);
  }

  return response;
};

/**
 * Next.js middleware for route optimization (UX redirects).
 *
 * Security model:
 * - Authentication gating is enforced here (Edge) for protected routes.
 * - Authorization is enforced by database RLS (ultimate source of truth) and route-level loaders.
 *
 * This middleware provides:
 * - Default-locale marketing URLs without redirect on `/`
 * - `X-NEXT-INTL-LOCALE` for `next-intl`
 * - UX optimization: early redirects for better user experience
 * - Route filtering: prevents loading unnecessary pages
 * - Email verification checks: redirects unverified users
 *
 * On error, fails open (allows access) - RLS will still protect data access.
 */
export const middleware = async (
  request: NextRequest
): Promise<NextResponse> => {
  const { pathname } = request.nextUrl;
  const cookieLocale = request.cookies.get(localeCookieName)?.value;

  // Public marketing URLs are rewritten from `/` and `/{locale}` into `/marketing/{locale}`.
  if (
    pathname === INTERNAL_MARKETING_ROOT ||
    pathname.startsWith(`${INTERNAL_MARKETING_ROOT}/`)
  ) {
    const suffix =
      pathname === INTERNAL_MARKETING_ROOT
        ? PAGE_ROUTES.HOME
        : pathname.slice(INTERNAL_MARKETING_ROOT.length);
    return NextResponse.redirect(new URL(suffix, request.url));
  }

  const acceptLanguage = request.headers.get("accept-language");
  const normalizedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const pathLocale = getMarketingLocaleFromPathname(pathname);
  const isMarketingHome =
    normalizedPathname === PAGE_ROUTES.HOME ||
    (pathLocale !== null && normalizedPathname === `/${pathLocale}`);

  if (isMarketingHome) {
    const code = request.nextUrl.searchParams.get("code");
    const type = request.nextUrl.searchParams.get("type");
    const next = request.nextUrl.searchParams.get("next");

    if (code) {
      const nextPath = sanitizeInternalRedirectPath(
        next,
        getAuthCodeRedirectTarget(type)
      );

      return appendLocaleResponseCookies(
        NextResponse.redirect(
          new URL(
            buildAuthCallbackPath({
              code,
              nextPath,
              fallbackPath: getAuthCodeRedirectTarget(type),
            }),
            request.url
          )
        ),
        pathname,
        cookieLocale
      );
    }
  }

  if (isMarketingPublicRoute(pathname)) {
    if (
      !cookieLocale &&
      !pathLocale &&
      isDefaultLocaleMarketingPathname(pathname)
    ) {
      const initialMarketingLocale = resolveRuntimeLocale({ acceptLanguage });

      if (initialMarketingLocale !== defaultLocale) {
        const localizedPathname = localizeMarketingPathname(
          pathname,
          initialMarketingLocale
        );
        const redirectUrl = new URL(localizedPathname, request.url);
        redirectUrl.search = request.nextUrl.search;

        return setLocaleCookie(
          NextResponse.redirect(redirectUrl),
          initialMarketingLocale
        );
      }
    }

    return appendLocaleResponseCookies(
      handleMarketingLocale(request),
      pathname,
      cookieLocale
    );
  }

  const resolvedLocale = resolveRuntimeLocale({
    cookieLocale,
    acceptLanguage,
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NEXT_INTL_LOCALE_HEADER_NAME, resolvedLocale);

  const isAuthPage =
    pathname === AUTH_PAGE_ROUTES.SIGNIN ||
    pathname === AUTH_PAGE_ROUTES.SIGNUP;
  const isProtected = isProtectedRoute(pathname);

  if (!isAuthPage && !isProtected) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return appendLocaleResponseCookies(response, pathname, cookieLocale);
  }

  const hasAuthCookie = hasSupabaseAuthCookie(
    request.cookies.getAll().map((cookie) => cookie.name)
  );

  if (!hasAuthCookie) {
    if (isProtected) {
      const signInUrl = new URL(AUTH_PAGE_ROUTES.SIGNIN, request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return appendLocaleResponseCookies(response, pathname, cookieLocale);
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

    if (user && isAuthPage) {
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

    return appendLocaleResponseCookies(response, pathname, cookieLocale);
  } catch (error) {
    console.error("[Middleware] Authentication error:", error);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return appendLocaleResponseCookies(response, pathname, cookieLocale);
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
