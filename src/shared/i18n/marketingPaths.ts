import type { Locale } from "@/shared/i18n/types";

import { isSupportedLocale } from "./config";

/**
 * Marketing routes use a locale prefix: /{locale}, /{locale}/pricing, /{locale}/legal.
 * App routes (workspace, auth, join, api) stay unprefixed.
 */
export const buildMarketingHomePath = (locale: Locale): string => {
  return `/${locale}`;
};

export const buildMarketingPricingPath = (locale: Locale): string => {
  return `/${locale}/pricing`;
};

export const buildMarketingLegalPath = (locale: Locale): string => {
  return `/${locale}/legal`;
};

/**
 * Returns the locale segment if the pathname is a marketing route with prefix.
 */
export const getMarketingLocaleFromPathname = (
  pathname: string
): Locale | null => {
  const match = pathname.match(/^\/(fr|en|es)(?:\/|$)/);
  if (!match?.[1]) {
    return null;
  }

  return isSupportedLocale(match[1]) ? match[1] : null;
};
