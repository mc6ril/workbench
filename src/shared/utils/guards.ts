import type { ProjectRole } from "@/core/domain/project/project.schema";

import { PROJECT_ROLES } from "@/shared/constants";

/**
 * Type guards and validation utilities.
 * Provides simple, reusable functions for common validation patterns.
 */

/**
 * Type guard to check if a value is an object (not null, not array).
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a string (can be empty).
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard to check if an error object has a code property.
 * Useful for checking domain errors vs unknown errors.
 */
export function isErrorWithCode(
  error: unknown
): error is { code: string; [key: string]: unknown } {
  return isObject(error) && "code" in error && typeof error.code === "string";
}

/**
 * Checks if an error has one of the specified error codes.
 * Useful for determining if an error should be re-thrown vs wrapped.
 */
export function hasErrorCode(
  error: unknown,
  codes: string[]
): error is { code: string; [key: string]: unknown } {
  if (!isErrorWithCode(error)) {
    return false;
  }
  return codes.includes(error.code);
}

/**
 * Checks if a value is a non-empty array.
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard to check if a string is a valid ProjectRole.
 * @param value - String to check
 * @returns true if value is a valid ProjectRole
 */
export function isProjectRole(value: string): value is ProjectRole {
  return PROJECT_ROLES.includes(value as ProjectRole);
}
