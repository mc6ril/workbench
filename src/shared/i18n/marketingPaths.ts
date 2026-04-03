import type { Locale } from "@/shared/i18n/types";

import { defaultLocale, isSupportedLocale } from "./config";

const normalizeMarketingPathname = (pathname: string): string => {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

/**
 * Marketing routes keep the default locale unprefixed (`/`, `/pricing`, `/legal`)
 * and use a locale prefix for secondary locales (`/en`, `/es`, ...).
 * App routes (workspace, auth, join, api) stay unprefixed.
 */
export const buildMarketingHomePath = (locale: Locale): string => {
  return locale === defaultLocale ? "/" : `/${locale}`;
};

export const buildMarketingPricingPath = (locale: Locale): string => {
  return locale === defaultLocale ? "/pricing" : `/${locale}/pricing`;
};

export const buildMarketingLegalPath = (locale: Locale): string => {
  return locale === defaultLocale ? "/legal" : `/${locale}/legal`;
};

/**
 * Returns the locale segment when the pathname uses an explicit locale prefix.
 */
export const getMarketingLocaleFromPathname = (
  pathname: string
): Locale | null => {
  const match = normalizeMarketingPathname(pathname).match(
    /^\/(fr|en|es)(?:$|\/(?:pricing|legal)(?:\/.*)?)/
  );
  if (!match?.[1]) {
    return null;
  }

  return isSupportedLocale(match[1]) ? match[1] : null;
};

/**
 * Returns true for default-locale marketing paths served without a locale prefix.
 */
export const isDefaultLocaleMarketingPathname = (pathname: string): boolean => {
  const normalizedPathname = normalizeMarketingPathname(pathname);

  return (
    normalizedPathname === "/" ||
    normalizedPathname === "/pricing" ||
    normalizedPathname === "/legal" ||
    normalizedPathname.startsWith("/legal/")
  );
};

/**
 * Resolves the marketing locale encoded by the URL itself.
 * - `/`, `/pricing`, `/legal` => default locale
 * - `/{locale}`, `/{locale}/pricing`, `/{locale}/legal` => explicit locale
 */
export const getResolvedMarketingLocaleFromPathname = (
  pathname: string
): Locale | null => {
  const explicitLocale = getMarketingLocaleFromPathname(pathname);
  if (explicitLocale) {
    return explicitLocale;
  }

  return isDefaultLocaleMarketingPathname(pathname) ? defaultLocale : null;
};

/**
 * Returns true when a marketing route uses the legacy default-locale prefix.
 */
export const isDefaultLocalePrefixedMarketingPathname = (
  pathname: string
): boolean => {
  const normalizedPathname = normalizeMarketingPathname(pathname);
  const escapedDefaultLocale = defaultLocale.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const prefixedMarketingPath = new RegExp(
    `^/${escapedDefaultLocale}(?:$|/(pricing|legal)(?:/.*)?)`
  );

  return prefixedMarketingPath.test(normalizedPathname);
};

/**
 * Strips the legacy default-locale prefix from a marketing pathname.
 */
export const stripDefaultLocalePrefix = (pathname: string): string => {
  const normalizedPathname = normalizeMarketingPathname(pathname);

  if (!isDefaultLocalePrefixedMarketingPathname(normalizedPathname)) {
    return normalizedPathname;
  }

  const strippedPath = normalizedPathname.slice(`/${defaultLocale}`.length);
  return strippedPath.length > 0 ? strippedPath : "/";
};
