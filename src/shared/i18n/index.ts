/**
 * i18n translation system exports.
 */

export { defaultLocale, getLocale, supportedLocales } from "./config";
export type { Locale, TranslationKey, TranslationMessages } from "./types";
export { useTranslation } from "@/presentation/hooks/useTranslation";
