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
  | `pages.landing.${string}`
  | `forms.${string}`
  | `errors.${string}`;

export type Locale = "fr";

export type TranslationMessages = {
  common: Record<string, string>;
  pages: {
    signup: Record<string, string | Record<string, string>>;
    signin: Record<string, string | Record<string, string>>;
    verifyEmail: Record<string, string | Record<string, string>>;
    resetPassword: Record<string, string | Record<string, string>>;
    updatePassword: Record<string, string | Record<string, string>>;
    home: Record<string, string | Record<string, string>>;
    landing: Record<string, string | Record<string, string>>;
  };
  forms: Record<string, string | Record<string, unknown>>;
  errors: Record<string, string | Record<string, unknown>>;
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
