/**
 * Type definitions for i18n translation keys.
 * This provides type safety for translation keys.
 */

export type TranslationKey =
  | `common.${string}`
  | `pages.signup.${string}`
  | `pages.signin.${string}`
  | `pages.home.${string}`
  | `forms.${string}`
  | `errors.${string}`;

export type Locale = "fr";

export interface TranslationMessages {
  common: Record<string, string>;
  pages: {
    signup: Record<string, string | Record<string, string>>;
    signin: Record<string, string | Record<string, string>>;
    home: Record<string, string | Record<string, string>>;
  };
  forms: Record<string, string | Record<string, unknown>>;
  errors: Record<string, string | Record<string, unknown>>;
}

