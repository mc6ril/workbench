import type { Locale } from "./types";

/**
 * Default locale for the application.
 */
export const defaultLocale: Locale = "fr";

/**
 * Cookie used to persist an explicit locale choice across requests.
 */
export const localeCookieName = "workbench-locale";

const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

/**
 * External getter set at runtime by the locale store.
 * Allows getLocale() to read the current locale without coupling shared logic
 * to the presentation implementation.
 */
let localeGetter: (() => Locale) | null = null;

/**
 * Registers a locale getter function from the presentation layer.
 * Called by the presentation layer whenever the active locale changes.
 */
export const registerLocaleGetter = (getter: () => Locale): void => {
  localeGetter = getter;
};

/**
 * Supported locales.
 */
export const supportedLocales: readonly Locale[] = Object.freeze([
  "fr",
  "en",
  "es",
]);

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
 * Returns true when the provided value matches one of the supported locales.
 */
export const isSupportedLocale = (value: string): value is Locale => {
  return supportedLocales.includes(value as Locale);
};

const normalizeLocaleToken = (value: string): string => {
  return value.trim().toLowerCase().replace(/_/g, "-");
};

/**
 * Matches a locale candidate against the supported locales.
 * Accepts both base locales ("fr") and BCP 47 variants ("fr-FR", "es_MX").
 */
export const matchSupportedLocale = (value?: string | null): Locale | null => {
  if (!value) {
    return null;
  }

  const normalizedValue = normalizeLocaleToken(value);

  if (isSupportedLocale(normalizedValue)) {
    return normalizedValue;
  }

  const baseLocale = normalizedValue.split("-")[0];
  return isSupportedLocale(baseLocale) ? baseLocale : null;
};

/**
 * Parses an Accept-Language header and returns locale candidates ordered by
 * quality and original appearance.
 */
export const parseAcceptLanguageHeader = (
  headerValue?: string | null
): string[] => {
  if (!headerValue) {
    return [];
  }

  return headerValue
    .split(",")
    .map((entry, index) => {
      const [languageRange, ...params] = entry.split(";");
      const qualityParam = params.find((param) =>
        param.trim().startsWith("q=")
      );
      const parsedQuality = qualityParam
        ? Number.parseFloat(qualityParam.split("=")[1] ?? "1")
        : 1;

      return {
        locale: languageRange?.trim() ?? "",
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
        index,
      };
    })
    .filter((candidate) => candidate.locale.length > 0 && candidate.quality > 0)
    .sort((left, right) => {
      if (right.quality !== left.quality) {
        return right.quality - left.quality;
      }

      return left.index - right.index;
    })
    .map((candidate) => candidate.locale);
};

type ResolveLocaleInput = {
  preferredLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
};

/**
 * Resolves the best locale for a request.
 * Priority:
 * 1. Explicitly chosen locale (eg. user preference)
 * 2. Persisted locale cookie
 * 3. Browser/system locale from Accept-Language
 * 4. Application default locale
 */
export const resolveLocale = ({
  preferredLocale,
  cookieLocale,
  acceptLanguage,
}: ResolveLocaleInput): Locale => {
  const explicitLocale = matchSupportedLocale(preferredLocale);
  if (explicitLocale) {
    return explicitLocale;
  }

  const persistedLocale = matchSupportedLocale(cookieLocale);
  if (persistedLocale) {
    return persistedLocale;
  }

  for (const candidate of parseAcceptLanguageHeader(acceptLanguage)) {
    const matchedLocale = matchSupportedLocale(candidate);
    if (matchedLocale) {
      return matchedLocale;
    }
  }

  return defaultLocale;
};

/**
 * Persists an explicit locale choice in the browser.
 */
export const persistLocaleCookie = (locale: Locale): void => {
  if (typeof document === "undefined") {
    return;
  }

  const secureSuffix =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie =
    `${localeCookieName}=${locale}; Path=/; Max-Age=${localeCookieMaxAgeSeconds}; ` +
    `SameSite=Lax${secureSuffix}`;
};

/**
 * Get the current active locale.
 * Reads from the registered locale getter if available,
 * otherwise falls back to the default locale.
 */
export const getLocale = (): Locale => {
  return localeGetter ? localeGetter() : defaultLocale;
};

/**
 * Get the Intl-compatible locale string (BCP 47) for the provided locale.
 * Useful for Intl.DateTimeFormat, Intl.NumberFormat, etc.
 */
export const getIntlLocale = (locale: Locale = getLocale()): string => {
  return localeToIntlMap[locale];
};
