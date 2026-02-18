import type { Locale } from "./types";

/**
 * Default locale for the application.
 */
export const defaultLocale: Locale = "fr";

/**
 * External getter set at runtime by the locale store.
 * Allows getLocale() to read the current locale without importing Zustand in shared/.
 */
let localeGetter: (() => Locale) | null = null;

/**
 * Registers a locale getter function from the presentation layer.
 * Called once during app initialization by the locale store.
 */
export const registerLocaleGetter = (getter: () => Locale): void => {
  localeGetter = getter;
};

/**
 * Supported locales.
 */
export const supportedLocales: Locale[] = ["fr", "en", "es"];

/**
 * Supported locales with native language labels.
 * Labels use native names (e.g. "Français" not "French") as they are language-independent.
 */
export const supportedLocaleOptions: readonly {
  code: Locale;
  label: string;
}[] = Object.freeze([
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
]);

/**
 * Maps internal locale codes to BCP 47 / Intl-compatible locale strings.
 */
const localeToIntlMap: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
};

/**
 * Get the current active locale.
 * Reads from the registered locale getter (Zustand store) if available,
 * otherwise falls back to the default locale.
 */
export const getLocale = (): Locale => {
  return localeGetter ? localeGetter() : defaultLocale;
};

/**
 * Get the Intl-compatible locale string (BCP 47) for the current locale.
 * Useful for Intl.DateTimeFormat, Intl.NumberFormat, etc.
 */
export const getIntlLocale = (): string => {
  return localeToIntlMap[getLocale()];
};
