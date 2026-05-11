import { PAGE_ROUTES } from "@/shared/constants/routes";

import {
  defaultLocale,
  isSupportedLocale,
  type Locale,
  supportedLocales,
} from "./config";

const localePattern = supportedLocales.join("|");
const LEAF_ROUTES = [PAGE_ROUTES.LEGAL] as const;
const leafRoutePattern = LEAF_ROUTES.map((value) => value.slice(1)).join("|");
const explicitLocalePattern = new RegExp(
  `^/(${localePattern})(?:$|/(?:${leafRoutePattern})(?:/.*)?)`
);

const normalizePathname = (pathname: string): string => {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

/**
 * Public routes keep the default locale unprefixed (`/`, `/legal`)
 * and use a locale prefix for secondary locales (`/en`, `/es`, ...).
 * App routes (workspace, auth, join, api) stay unprefixed.
 */
export const buildHomePath = (locale: Locale): string => {
  return locale === defaultLocale ? PAGE_ROUTES.HOME : `/${locale}`;
};

export const buildLegalPath = (locale: Locale): string => {
  return locale === defaultLocale
    ? PAGE_ROUTES.LEGAL
    : `/${locale}${PAGE_ROUTES.LEGAL}`;
};

/**
 * Rewrites a public pathname to its locale-specific URL.
 * Non-public paths are returned unchanged.
 */
export const localizePublicPathname = (
  pathname: string,
  locale: Locale
): string => {
  const normalized = normalizePathname(pathname);
  const explicitLocale = getLocaleFromPublicPathname(normalized);

  if (explicitLocale) {
    const suffix = normalized.slice(explicitLocale.length + 1);

    return locale === defaultLocale
      ? suffix || PAGE_ROUTES.HOME
      : `/${locale}${suffix}`;
  }

  if (!isDefaultLocalePath(normalized)) {
    return normalized;
  }

  return locale === defaultLocale
    ? normalized
    : normalized === PAGE_ROUTES.HOME
      ? `/${locale}`
      : `/${locale}${normalized}`;
};

/**
 * Returns the locale segment when the pathname uses an explicit locale prefix.
 */
export const getLocaleFromPublicPathname = (
  pathname: string
): Locale | null => {
  const match = normalizePathname(pathname).match(explicitLocalePattern);
  if (!match?.[1]) {
    return null;
  }

  return isSupportedLocale(match[1]) ? match[1] : null;
};

/**
 * Returns true for default-locale paths served without a locale prefix.
 */
export const isDefaultLocalePath = (pathname: string): boolean => {
  const normalized = normalizePathname(pathname);

  return (
    normalized === PAGE_ROUTES.HOME ||
    normalized === PAGE_ROUTES.LEGAL ||
    normalized.startsWith(`${PAGE_ROUTES.LEGAL}/`)
  );
};

/**
 * Resolves the locale encoded by the URL itself.
 * - `/`, `/legal` => default locale
 * - `/{locale}`, `/{locale}/legal` => explicit locale
 */
export const getResolvedLocaleFromPathname = (
  pathname: string
): Locale | null => {
  const explicitLocale = getLocaleFromPublicPathname(pathname);
  if (explicitLocale) {
    return explicitLocale;
  }

  return isDefaultLocalePath(pathname) ? defaultLocale : null;
};
