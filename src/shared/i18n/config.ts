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
 * Get the current locale.
 * For now, we always use the default locale.
 * In the future, this can be extended to support locale detection.
 */
export const getLocale = (): Locale => {
  return defaultLocale;
};

