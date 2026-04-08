import type { TranslationFunction } from "./types";

/**
 * Translation keys for project roles.
 */
export type RoleLabelKey = "roleAdmin" | "roleMember" | "roleViewer";

/**
 * Maps a project role string to its corresponding i18n translation key.
 *
 * @param role - The project role
 * @returns The translation key for the role label
 *
 * @example
 * ```tsx
 * const t = useTranslations("pages.workspace");
 * const roleKey = getRoleLabelKey("admin");
 * const label = t(roleKey); // "Administrateur"
 * ```
 */
export const getRoleLabelKey = (role: string): RoleLabelKey => {
  switch (role) {
    case "admin":
      return "roleAdmin";
    case "member":
      return "roleMember";
    case "viewer":
      return "roleViewer";
    default:
      return "roleMember";
  }
};

/**
 * Creates a type-safe interpolation wrapper for translation functions.
 * This provides better type safety when using interpolation.
 *
 * @param t - The translation function
 * @returns A function that handles interpolation with type safety
 *
 * @example
 * ```tsx
 * const t = useTranslations("common");
 * const translate = createInterpolatedTranslation(t);
 * const message = translate("welcome", { name: "John" }); // "Bienvenue, John!"
 * ```
 */
export const createInterpolatedTranslation = (
  t: TranslationFunction
): ((key: string, params?: Record<string, string | number>) => string) => {
  return (key: string, params?: Record<string, string | number>): string => {
    return t(key, params);
  };
};

/**
 * Returns a translation key based on a boolean condition.
 *
 * @param condition - The boolean condition
 * @param trueKey - The key to return if condition is true
 * @param falseKey - The key to return if condition is false
 * @returns The selected translation key
 *
 * @example
 * ```tsx
 * const t = useTranslations("forms.ticket.fields.status");
 * const labelKey = getConditionalTranslation(isCompleted, "label_completed", "label");
 * const label = t(labelKey);
 * ```
 */
export const getConditionalTranslation = (
  condition: boolean,
  trueKey: string,
  falseKey: string
): string => {
  return condition ? trueKey : falseKey;
};
