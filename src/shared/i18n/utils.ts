import type { TranslationMessages } from "./types";

/**
 * Escapes special regex characters in a string.
 *
 * @param str - The string to escape
 * @returns The escaped string safe for use in regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Interpolates a translation string by replacing placeholders with values.
 *
 * @param translation - The translation string with placeholders (e.g., "Hello {name}")
 * @param params - Object containing values to replace placeholders
 * @returns The interpolated string
 *
 * @example
 * ```ts
 * interpolateTranslation("Hello {name}", { name: "John" }); // "Hello John"
 * interpolateTranslation("Count: {count}", { count: 5 }); // "Count: 5"
 * ```
 */
export function interpolateTranslation(
  translation: string,
  params: Record<string, string | number>
): string {
  let result = translation;

  Object.entries(params).forEach(([key, value]) => {
    const escapedKey = escapeRegex(key);
    const stringValue = String(value);
    // Use a function as replacement to avoid special sequence interpretation ($1, $&, etc.)
    result = result.replace(
      new RegExp(`\\{${escapedKey}\\}`, "g"),
      () => stringValue
    );
  });

  return result;
}

/**
 * Validates that a translation key exists in the given namespace.
 *
 * @param key - The translation key to validate (e.g., "loading" or "errors.invalidEmail")
 * @param namespace - The namespace path (e.g., "common" or "pages.signup")
 * @param messages - The translation messages object
 * @returns True if the key exists, false otherwise
 *
 * @example
 * ```ts
 * validateTranslationKey("loading", "common", messages); // true
 * validateTranslationKey("invalidKey", "common", messages); // false
 * ```
 */
export function validateTranslationKey(
  key: string,
  namespace: string,
  messages: TranslationMessages
): boolean {
  const namespaceValue = getNamespaceValue(messages, namespace);
  if (!namespaceValue) {
    return false;
  }

  const keyParts = key.split(".");
  let current: unknown = namespaceValue;

  for (const part of keyParts) {
    if (
      current &&
      typeof current === "object" &&
      part in current &&
      typeof (current as Record<string, unknown>)[part] === "object"
    ) {
      current = (current as Record<string, unknown>)[part];
    } else if (
      current &&
      typeof current === "object" &&
      part in current &&
      typeof (current as Record<string, unknown>)[part] === "string"
    ) {
      return true;
    } else {
      return false;
    }
  }

  return typeof current === "string";
}

/**
 * Gets the translation value for a given namespace and key.
 *
 * @param messages - The translation messages object
 * @param namespace - The namespace path (e.g., "common" or "pages.signup")
 * @param key - The translation key (e.g., "loading" or "errors.invalidEmail")
 * @returns The translation string, or undefined if not found
 *
 * @example
 * ```ts
 * getTranslationValue(messages, "common", "loading"); // "Chargement en cours..."
 * getTranslationValue(messages, "pages.signup", "errors.invalidEmail"); // "Adresse email invalide"
 * ```
 */
export function getTranslationValue(
  messages: TranslationMessages,
  namespace: string,
  key: string
): string | undefined {
  const namespaceValue = getNamespaceValue(messages, namespace);
  if (!namespaceValue) {
    return undefined;
  }

  const keyParts = key.split(".");
  let current: unknown = namespaceValue;

  for (const part of keyParts) {
    if (
      current &&
      typeof current === "object" &&
      part in current &&
      typeof (current as Record<string, unknown>)[part] === "object"
    ) {
      current = (current as Record<string, unknown>)[part];
    } else if (
      current &&
      typeof current === "object" &&
      part in current &&
      typeof (current as Record<string, unknown>)[part] === "string"
    ) {
      return (current as Record<string, string>)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Gets the namespace value from the messages object.
 *
 * @param messages - The translation messages object
 * @param path - The namespace path (e.g., "common" or "pages.signup")
 * @returns The namespace value, or undefined if not found
 */
function getNamespaceValue(
  messages: TranslationMessages,
  path: string
): Record<string, string | Record<string, unknown>> | undefined {
  const parts = path.split(".");
  let current: unknown = messages;

  for (const part of parts) {
    if (
      current &&
      typeof current === "object" &&
      part in current &&
      typeof (current as Record<string, unknown>)[part] === "object"
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  if (current && typeof current === "object") {
    return current as Record<string, string | Record<string, unknown>>;
  }

  return undefined;
}
