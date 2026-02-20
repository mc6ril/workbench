/**
 * Centralized mapping of Zod English validation messages to relative i18n field keys.
 * Used by auth forms (signin, signup) to translate raw Zod messages into
 * the caller's field namespace (e.g. "pages.signin.fields" or "pages.signup.fields").
 */
export const AUTH_ZOD_FIELD_MESSAGES: Record<string, string> = {
  "Email is required": "email.required",
  "Invalid email format": "email.invalid",
  "Password is required": "password.required",
  "Password must be at least 6 characters": "password.tooShort",
  "Password must be less than 100 characters": "password.tooLong",
  "Password confirmation is required": "confirmPassword.label",
  "Passwords do not match": "confirmPassword.label",
};

/**
 * Translates a react-hook-form field error using the Zod-to-i18n mapping.
 * Server errors (type "server") are already translated and returned as-is.
 *
 * @param error - The field error from react-hook-form
 * @param tFields - A translation function scoped to the page's fields namespace
 * @returns The translated message, or undefined if no error
 */
export const translateFieldError = (
  error: { type?: string; message?: string } | undefined,
  tFields: (key: string) => string
): string | undefined => {
  if (!error?.message) {
    return undefined;
  }
  if (error.type === "server") {
    return error.message;
  }
  const i18nKey = AUTH_ZOD_FIELD_MESSAGES[error.message];
  return i18nKey ? tFields(i18nKey) : error.message;
};
