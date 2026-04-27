import { type NextRequest, NextResponse } from "next/server";
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
import { resolveRuntimeLocale } from "@/shared/i18n/runtimeLocale";
import { LIGHT_USER_COOKIE_NAME } from "@/shared/infrastructure/storage/userIdentityStorageKeys";
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

import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import { decodeLightUserCookie } from "@/domains/session/infrastructure/lightUserCookie";
import {
  encodeSessionHeader,
  SESSION_HEADER_NAME,
} from "@/domains/session/infrastructure/sessionHeader";
import { mapIdentityToCurrentSession } from "@/domains/session/infrastructure/sessionIdentity";
import { mapSupabaseClaimsToCurrentSession } from "@/domains/session/infrastructure/supabase/sessionClaims";

const NEXT_INTL_LOCALE_HEADER_NAME = "X-NEXT-INTL-LOCALE";
const INTERNAL_MARKETING_ROOT = "/marketing";

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

const normalizePathname = (pathname: string): string => {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
};

const getMarketingPathSuffix = (pathname: string): string => {
  const normalizedPathname = normalizePathname(pathname);
  const pathLocale = getMarketingLocaleFromPathname(normalizedPathname);

  if (pathLocale) {
    return normalizedPathname.slice(pathLocale.length + 1) || PAGE_ROUTES.HOME;
  }

  return normalizedPathname;
};

const rewriteMarketingPath = (
  request: NextRequest,
  locale: string
): NextResponse => {
  const suffix = getMarketingPathSuffix(request.nextUrl.pathname);
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `${INTERNAL_MARKETING_ROOT}/${locale}${
    suffix === PAGE_ROUTES.HOME ? "" : suffix
  }`;

  return NextResponse.rewrite(rewriteUrl);
};

const createForwardResponse = (
  forwardHeaders: Headers,
  sourceResponse?: NextResponse
): NextResponse => {
  const response = NextResponse.next({
    request: {
      headers: forwardHeaders,
    },
  });

  sourceResponse?.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  return response;
};

const setForwardedSessionHeader = (
  headers: Headers,
  session: CurrentSession
): void => {
  headers.set(SESSION_HEADER_NAME, encodeSessionHeader(session));
};

const enrichSessionFromLightCookie = (
  session: CurrentSession,
  lightCookieRaw?: string | null
): CurrentSession => {
  const light = decodeLightUserCookie(lightCookieRaw);

  if (!light) {
    return session;
  }

  return {
    ...session,
    ...(session.displayName ? {} : { displayName: light.displayName }),
    ...(session.avatarUrl ? {} : { avatarUrl: light.avatarUrl }),
  };
};

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
      encode: "tokens-only",
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
 * Marketing/i18n middleware plus lightweight protected-route auth gating.
 * Protected routes validate signed claims first and fall back to user recovery
 * only when the cookie exists but claims are not enough.
 */
export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const { pathname } = request.nextUrl;
  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  const lightUserCookie = request.cookies.get(LIGHT_USER_COOKIE_NAME)?.value;
  const normalizedPathname = normalizePathname(pathname);

  // Public marketing URLs are rewritten from `/` and `/{locale}` into `/marketing/{locale}`.
  if (
    pathname === INTERNAL_MARKETING_ROOT ||
    pathname.startsWith(`${INTERNAL_MARKETING_ROOT}/`)
  ) {
    const suffix =
      pathname === INTERNAL_MARKETING_ROOT
        ? PAGE_ROUTES.HOME
        : pathname.slice(INTERNAL_MARKETING_ROOT.length);
    const suffixLocale = getMarketingLocaleFromPathname(suffix);
    const publicPathname =
      suffixLocale === defaultLocale
        ? localizeMarketingPathname(suffix, defaultLocale)
        : suffix;

    return NextResponse.redirect(new URL(publicPathname, request.url));
  }

  const acceptLanguage = request.headers.get("accept-language");
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
    if (pathLocale === defaultLocale) {
      const canonicalPathname = localizeMarketingPathname(
        pathname,
        defaultLocale
      );
      const redirectUrl = new URL(canonicalPathname, request.url);
      redirectUrl.search = request.nextUrl.search;

      return setLocaleCookie(NextResponse.redirect(redirectUrl), defaultLocale);
    }

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
      rewriteMarketingPath(
        request,
        getResolvedMarketingLocaleFromPathname(pathname) ?? defaultLocale
      ),
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
  requestHeaders.delete(SESSION_HEADER_NAME);

  const isAuthPage =
    pathname === AUTH_PAGE_ROUTES.SIGNIN ||
    pathname === AUTH_PAGE_ROUTES.SIGNUP;
  const isProtected = isProtectedRoute(pathname);

  if (!isAuthPage && !isProtected) {
    const response = createForwardResponse(requestHeaders);

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

    const response = createForwardResponse(requestHeaders);

    return appendLocaleResponseCookies(response, pathname, cookieLocale);
  }

  const { supabase, response: authResponse } =
    createSupabaseClientForMiddleware(request, requestHeaders);
  const { data: claimsResult, error: claimsError } =
    await supabase.auth.getClaims();
  const currentSession = !claimsError
    ? mapSupabaseClaimsToCurrentSession(claimsResult?.claims)
    : null;

  if (currentSession) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL(PAGE_ROUTES.WORKSPACE, request.url));
    }

    setForwardedSessionHeader(
      requestHeaders,
      enrichSessionFromLightCookie(currentSession, lightUserCookie)
    );
    return appendLocaleResponseCookies(
      createForwardResponse(requestHeaders, authResponse),
      pathname,
      cookieLocale
    );
  }

  if (isProtected) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const recoveredSession =
      user && !userError
        ? mapIdentityToCurrentSession({
            userId: user.id,
            email: user.email,
            appMetadata: user.app_metadata,
            userMetadata: user.user_metadata,
          })
        : null;

    if (recoveredSession) {
      setForwardedSessionHeader(
        requestHeaders,
        enrichSessionFromLightCookie(recoveredSession, lightUserCookie)
      );
      return appendLocaleResponseCookies(
        createForwardResponse(requestHeaders, authResponse),
        pathname,
        cookieLocale
      );
    }

    const signInUrl = new URL(AUTH_PAGE_ROUTES.SIGNIN, request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const response = createForwardResponse(requestHeaders);

  return appendLocaleResponseCookies(response, pathname, cookieLocale);
};

/**
 * Middleware configuration.
 * Matches request paths except static assets and API.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
