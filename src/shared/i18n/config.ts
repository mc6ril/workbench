import type { Locale } from "./types";

/**
 * Default locale for the application.
 */
export const defaultLocale: Locale = "fr";

/**
 * Supported locales.
 */
export const supportedLocales: Locale[] = ["fr"];

/**
 * Maps internal locale codes to BCP 47 / Intl-compatible locale strings.
 */
const localeToIntlMap: Record<Locale, string> = {
  fr: "fr-FR",
};

/**
 * Get the current locale.
 * For now, we always use the default locale.
 * In the future, this can be extended to support locale detection.
 */
export const getLocale = (): Locale => {
  return defaultLocale;
};

/**
 * Get the Intl-compatible locale string (BCP 47) for the current locale.
 * Useful for Intl.DateTimeFormat, Intl.NumberFormat, etc.
 */
export const getIntlLocale = (): string => {
  return localeToIntlMap[getLocale()];
};

