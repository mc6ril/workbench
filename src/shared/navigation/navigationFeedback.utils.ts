import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { isProjectRoute, isProtectedRoute } from "@/shared/utils/routes";

const sortSearchParams = (search: string): string => {
  if (!search || search === "?") {
    return "";
  }
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search
  );
  const keys = [...new Set([...params.keys()])].sort();
  const sorted = new URLSearchParams();
  for (const key of keys) {
    const values = params.getAll(key);
    for (const value of values) {
      sorted.append(key, value);
    }
  }
  const serialized = sorted.toString();
  return serialized ? `?${serialized}` : "";
};

type ParsedNavigationHref = {
  normalized: string;
  pathname: string;
  searchParams: URLSearchParams;
};

const getNavigationBaseOrigin = (baseOrigin?: string): string => {
  return (
    baseOrigin ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost")
  );
};

const parseNavigationHref = (
  href: string,
  baseOrigin?: string
): ParsedNavigationHref | null => {
  const trimmed = href.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed, getNavigationBaseOrigin(baseOrigin));
    const search = sortSearchParams(url.search);
    return {
      normalized: `${url.pathname}${search}`,
      pathname: url.pathname,
      searchParams: new URLSearchParams(url.search),
    };
  } catch {
    if (!trimmed.startsWith("/")) {
      return null;
    }

    const hashIndex = trimmed.indexOf("#");
    const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
    const qIndex = withoutHash.indexOf("?");
    const pathname = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
    const search = qIndex >= 0 ? withoutHash.slice(qIndex) : "";

    return {
      normalized: `${pathname}${sortSearchParams(search)}`,
      pathname,
      searchParams: new URLSearchParams(
        search.startsWith("?") ? search.slice(1) : search
      ),
    };
  }
};

const isAuthEntryPath = (pathname: string): boolean => {
  return (
    pathname === AUTH_PAGE_ROUTES.SIGNIN || pathname === AUTH_PAGE_ROUTES.SIGNUP
  );
};

/**
 * Accepts the final route of a navigation when it matches the requested href
 * directly or through a known app redirect (middleware auth guards, project
 * root redirect to board, etc.).
 */
export const doesNavigationCompletionMatchTarget = (
  targetHref: string,
  resolvedHref: string,
  baseOrigin?: string
): boolean => {
  const target = parseNavigationHref(targetHref, baseOrigin);
  const resolved = parseNavigationHref(resolvedHref, baseOrigin);

  if (!target || !resolved) {
    return (
      normalizeNavigationHref(targetHref, baseOrigin) ===
      normalizeNavigationHref(resolvedHref, baseOrigin)
    );
  }

  if (target.normalized === resolved.normalized) {
    return true;
  }

  if (
    target.pathname !== PAGE_ROUTES.HOME &&
    resolved.pathname.startsWith(`${target.pathname}/`)
  ) {
    return true;
  }

  if (
    isAuthEntryPath(target.pathname) &&
    resolved.pathname === PAGE_ROUTES.WORKSPACE
  ) {
    return true;
  }

  if (
    isProtectedRoute(target.pathname) &&
    resolved.pathname === AUTH_PAGE_ROUTES.SIGNIN
  ) {
    if (resolved.searchParams.get("unverified") === "true") {
      return true;
    }

    const redirectPath = resolved.searchParams.get("redirect");
    if (!redirectPath) {
      return false;
    }

    const redirectTarget = parseNavigationHref(redirectPath, baseOrigin);
    return redirectTarget?.pathname === target.pathname;
  }

  if (isProjectRoute(target.pathname) && resolved.pathname === PAGE_ROUTES.WORKSPACE) {
    return true;
  }

  return false;
};

/**
 * Normalizes an href to `pathname + sorted search` for comparison (hash omitted).
 * Works with absolute URLs and app-relative paths when `baseUrl` is provided.
 */
export const normalizeNavigationHref = (
  href: string,
  baseOrigin?: string
): string => {
  const parsed = parseNavigationHref(href, baseOrigin);
  if (!parsed) {
    return "";
  }
  return parsed.normalized;
};

export const getCurrentLocationHrefNormalized = (): string => {
  if (typeof window === "undefined") {
    return "";
  }
  return normalizeNavigationHref(
    `${window.location.pathname}${window.location.search}`,
    window.location.origin
  );
};
