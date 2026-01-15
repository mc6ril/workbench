/**
 * Type definitions for i18n translation keys.
 * This provides type safety for translation keys.
 */

export type TranslationKey =
  | `common.${string}`
  | `pages.signup.${string}`
  | `pages.signin.${string}`
  | `pages.verifyEmail.${string}`
  | `pages.resetPassword.${string}`
  | `pages.updatePassword.${string}`
  | `pages.home.${string}`
  | `pages.backlog.${string}`
  | `pages.board.${string}`
  | `pages.epics.${string}`
  | `pages.ticketDetail.${string}`
  | `pages.landing.${string}`
  | `forms.${string}`
  | `errors.${string}`;

export type Locale = "fr";

export type TranslationValue = string | TranslationNode;

export type TranslationNode = {
  [key: string]: TranslationValue;
};

export type TranslationMessages = {
  common: TranslationNode;
  pages: TranslationNode;
  forms: TranslationNode;
  errors: TranslationNode;
};

/**
 * Namespace paths for translation namespaces.
 * Used to ensure type safety when specifying namespaces.
 */
export type Namespace =
  | "common"
  | "pages.signup"
  | "pages.signin"
  | "pages.verifyEmail"
  | "pages.resetPassword"
  | "pages.updatePassword"
  | "pages.home"
  | "pages.backlog"
  | "pages.board"
  | "pages.epics"
  | "pages.ticketDetail"
  | "pages.landing"
  | "forms"
  | "errors";

/**
 * Parameters for translation function interpolation.
 * Supports string and number values, with optional count for pluralization.
 */
export type TranslationParams = Record<string, string | number> & {
  count?: number;
};

/**
 * Translation function type.
 * Takes a key and optional parameters, returns the translated string.
 */
export type TranslationFunction = (
  key: string,
  params?: TranslationParams
) => string;
