import type { DomainRuleError } from "./domainRuleError";

/**
 * Type guard to check if an error is a DomainRuleError.
 * Validates that the error has a code property and matches domain rule error structure.
 */
export const isDomainRuleError = (
  error: unknown
): error is DomainRuleError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as Record<string, unknown>;

  // Must have a code property
  if (!("code" in err) || typeof err.code !== "string") {
    return false;
  }

  // Domain rule errors have codes that are NOT repository error codes
  const code = err.code;
  const isRepositoryCode =
    code === "NOT_FOUND" ||
    code === "CONSTRAINT_VIOLATION" ||
    code === "DATABASE_ERROR";

  // If it's a repository code, it's not a domain rule error
  if (isRepositoryCode) {
    return false;
  }

  // Domain rule error codes are typically business rule violations
  // Common patterns: INVALID_*, DUPLICATE_*, MISMATCH, etc.
  return true;
};
