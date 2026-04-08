import {
  useLocale as useNextIntlLocale,
  useTranslations,
} from "next-intl";

export {
  defaultLocale,
  getIntlLocale,
  isSupportedLocale,
  localeCookieName,
  matchSupportedLocale,
  parseAcceptLanguageHeader,
  persistLocaleCookie,
  resolveLocale,
  supportedLocaleOptions,
  supportedLocales,
} from "./config";
export type { RoleLabelKey } from "./dynamic";
export {
  createInterpolatedTranslation,
  getConditionalTranslation,
  getRoleLabelKey,
} from "./dynamic";
export { routing } from "./routing";
export type { Locale, TranslationFunction, TranslationValues } from "./types";
export { useLocalePreference } from "./useLocalePreference";
export { AUTH_ZOD_FIELD_MESSAGES, translateFieldError } from "./zodFieldErrors";

import type { Locale } from "./types";

export const useLocale = (): Locale => {
  return useNextIntlLocale() as Locale;
};

export { useTranslations };
