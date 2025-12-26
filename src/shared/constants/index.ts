import type { ProjectRole } from "@/core/domain/project.schema";

/**
 * Array of all valid project roles.
 * Used for validation and iteration over roles.
 */
export const PROJECT_ROLES: readonly ProjectRole[] = Object.freeze([
  "admin",
  "member",
  "viewer",
]);

// Re-export route constants for convenience
export type { ProjectView } from "./routes";
export { PROJECT_VIEWS, PROTECTED_ROUTES, PUBLIC_ROUTES } from "./routes";

// Re-export error code constants for convenience
export type { AuthErrorCode, RepositoryErrorCode } from "./errorCodes";
export { AUTH_ERROR_CODES, REPOSITORY_ERROR_CODES } from "./errorCodes";
