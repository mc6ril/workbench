/**
 * Domain-owned authentication constants.
 * Kept in core to avoid domain dependencies on shared/presentation modules.
 */
export const PASSWORD_LIMITS = Object.freeze({
  MIN_LENGTH: 8,
  MAX_LENGTH: 100,
});

/**
 * Default language for domain preference initialization.
 */
export const DEFAULT_LANGUAGE = "fr";
