import type { TranslationFunction } from "./types";

/**
 * Creates a pluralized translation key based on count.
 * French pluralization rules: singular for count === 1, plural otherwise.
 *
 * @param baseKey - The base translation key (e.g., "items")
 * @param count - The count to determine pluralization
 * @returns The pluralized key (e.g., "items" for count === 1, "items_other" for count !== 1)
 *
 * @example
 * ```ts
 * createPluralKey("items", 1); // "items"
 * createPluralKey("items", 5); // "items_other"
 * ```
 */
export function createPluralKey(baseKey: string, count: number): string {
  if (count === 1) {
    return baseKey;
  }
  return `${baseKey}_other`;
}

/**
 * Creates a type-safe interpolation wrapper for translation functions.
 * This provides better type safety when using interpolation.
 *
 * @param t - The translation function
 * @returns A function that handles interpolation with type safety
 *
 * @example
 * ```tsx
 * const t = useTranslation("common");
 * const translate = createInterpolatedTranslation(t);
 * const message = translate("welcome", { name: "John" }); // "Bienvenue, John!"
 * ```
 */
export function createInterpolatedTranslation(
  t: TranslationFunction
): (key: string, params?: Record<string, string | number>) => string {
  return (key: string, params?: Record<string, string | number>): string => {
    return t(key, params);
  };
}

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
 * const t = useTranslation("forms.ticket.fields.status");
 * const labelKey = getConditionalTranslation(isCompleted, "label_completed", "label");
 * const label = t(labelKey);
 * ```
 */
export function getConditionalTranslation(
  condition: boolean,
  trueKey: string,
  falseKey: string
): string {
  return condition ? trueKey : falseKey;
}
