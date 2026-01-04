/**
 * i18n translation system exports.
 */

export { defaultLocale, getLocale, supportedLocales } from "./config";
export type {
  Locale,
  Namespace,
  TranslationFunction,
  TranslationKey,
  TranslationMessages,
  TranslationParams,
} from "./types";
export { useTranslation } from "@/presentation/hooks/useTranslation";

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
} from "./dynamic";
