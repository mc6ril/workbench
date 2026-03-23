/**
 * i18n translation system exports.
 */

export {
  defaultLocale,
  getIntlLocale,
  getLocale,
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
export { LocaleProvider } from "./LocaleProvider";
export { getMessages } from "./messages";
export type {
  Locale,
  Namespace,
  TranslationFunction,
  TranslationKey,
  TranslationMessages,
  TranslationParams,
} from "./types";
export { useLocaleStore } from "./useLocaleStore";
export { useTranslation } from "./useTranslation";

// Translation utilities
export {
  getTranslationValue,
  interpolateTranslation,
  validateTranslationKey,
} from "./utils";

// Dynamic translation utilities
export {
  createInterpolatedTranslation,
  createPluralKey,
  getConditionalTranslation,
  getRoleLabelKey,
} from "./dynamic";

// Zod field error translation utilities
export { AUTH_ZOD_FIELD_MESSAGES, translateFieldError } from "./zodFieldErrors";
