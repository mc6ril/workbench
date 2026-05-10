import { PAGE_ROUTES } from "@/shared/constants/routes";

import {
  defaultLocale,
  isSupportedLocale,
  type Locale,
  supportedLocales,
} from "./config";

const marketingLocalePattern = supportedLocales.join("|");
const MARKETING_LEAF_ROUTES = [PAGE_ROUTES.LEGAL] as const;
const marketingLeafRoutePattern = MARKETING_LEAF_ROUTES.map((value) =>
  value.slice(1)
).join("|");
const explicitMarketingLocalePattern = new RegExp(
  `^/(${marketingLocalePattern})(?:$|/(?:${marketingLeafRoutePattern})(?:/.*)?)`
);

const normalizeMarketingPathname = (pathname: string): string => {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

/**
 * Marketing routes keep the default locale unprefixed (`/`, `/legal`)
 * and use a locale prefix for secondary locales (`/en`, `/es`, ...).
 * App routes (workspace, auth, join, api) stay unprefixed.
 */
export const buildMarketingHomePath = (locale: Locale): string => {
  return locale === defaultLocale ? PAGE_ROUTES.HOME : `/${locale}`;
};

export const buildMarketingLegalPath = (locale: Locale): string => {
  return locale === defaultLocale
    ? PAGE_ROUTES.LEGAL
    : `/${locale}${PAGE_ROUTES.LEGAL}`;
};

/**
 * Rewrites a marketing pathname to its locale-specific public URL.
 * Non-marketing paths are returned unchanged.
 */
export const localizeMarketingPathname = (
  pathname: string,
  locale: Locale
): string => {
  const normalizedPathname = normalizeMarketingPathname(pathname);
  const explicitLocale = getMarketingLocaleFromPathname(normalizedPathname);

  if (explicitLocale) {
    const suffix = normalizedPathname.slice(explicitLocale.length + 1);

    return locale === defaultLocale
      ? suffix || PAGE_ROUTES.HOME
      : `/${locale}${suffix}`;
  }

  if (!isDefaultLocaleMarketingPathname(normalizedPathname)) {
    return normalizedPathname;
  }

  return locale === defaultLocale
    ? normalizedPathname
    : normalizedPathname === PAGE_ROUTES.HOME
      ? `/${locale}`
      : `/${locale}${normalizedPathname}`;
};

/**
 * Returns the locale segment when the pathname uses an explicit locale prefix.
 */
export const getMarketingLocaleFromPathname = (
  pathname: string
): Locale | null => {
  const match = normalizeMarketingPathname(pathname).match(
    explicitMarketingLocalePattern
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
    normalizedPathname === PAGE_ROUTES.HOME ||
    normalizedPathname === PAGE_ROUTES.LEGAL ||
    normalizedPathname.startsWith(`${PAGE_ROUTES.LEGAL}/`)
  );
};

/**
 * Resolves the marketing locale encoded by the URL itself.
 * - `/`, `/legal` => default locale
 * - `/{locale}`, `/{locale}/legal` => explicit locale
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
