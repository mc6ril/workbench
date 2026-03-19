/**
 * Domain rule error types for business rule violations.
 * These errors are returned by domain validation functions and can be handled by usecases.
 */

/**
 * Base domain rule error type.
 * Errors contain only codes and metadata - no user-facing messages.
 * User-facing messages are translated in the presentation layer using i18n.
 */
export type DomainRuleError = {
  code: string;
  /**
   * Optional debug message for logging purposes only.
   * Never shown to users - use error.code with i18n for user-facing messages.
   */
  debugMessage?: string;
  /**
   * Optional field name for field-specific validation errors.
   */
  field?: string;
};

/**
 * Error factory function for domain rule violations.
 * Creates errors with codes and metadata only.
 * User-facing messages are translated in the presentation layer using i18n.
 */
export const createDomainRuleError = (
  code: string,
  debugMessage?: string,
  field?: string
): DomainRuleError => ({
  code,
  debugMessage,
  field,
});
