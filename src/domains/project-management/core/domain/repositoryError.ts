/**
 * Domain error types for repository operations.
 * These errors are returned by repositories and can be handled by usecases.
 */

/**
 * Base repository error type.
 * Errors contain only codes and metadata - no user-facing messages.
 * User-facing messages are translated in the presentation layer using i18n.
 */
export type RepositoryError = {
  code: string;
  /**
   * Optional debug message for logging purposes only.
   * Never shown to users - use error.code with i18n for user-facing messages.
   */
  debugMessage?: string;
};

/**
 * Error when a requested entity is not found.
 */
export type NotFoundError = RepositoryError & {
  code: "NOT_FOUND";
  entityType: string;
  entityId: string;
};

/**
 * Error when a database constraint is violated.
 */
export type ConstraintError = RepositoryError & {
  code: "CONSTRAINT_VIOLATION";
  constraint: string;
};

/**
 * Error when a database operation fails (network, connection, etc.).
 */
export type DatabaseError = RepositoryError & {
  code: "DATABASE_ERROR";
  originalError?: unknown;
};

/**
 * Union type of all repository error types.
 */
export type RepositoryErrorUnion = NotFoundError | ConstraintError | DatabaseError;

/**
 * Error factory functions.
 * These functions create errors with codes and metadata only.
 * User-facing messages are translated in the presentation layer using i18n.
 */
export const createNotFoundError = (
  entityType: string,
  entityId: string,
  debugMessage?: string
): NotFoundError => ({
  code: "NOT_FOUND",
  entityType,
  entityId,
  debugMessage: debugMessage ?? `${entityType} with id ${entityId} not found`,
});

export const createConstraintError = (
  constraint: string,
  debugMessage?: string
): ConstraintError => ({
  code: "CONSTRAINT_VIOLATION",
  constraint,
  debugMessage: debugMessage ?? `Database constraint violation: ${constraint}`,
});

export const createDatabaseError = (
  debugMessage: string,
  originalError?: unknown
): DatabaseError => ({
  code: "DATABASE_ERROR",
  debugMessage,
  originalError,
});
