// Re-export project role constants from domain for convenience
export {
  PROJECT_ROLES,
  ProjectRole,
} from "@/core/domain/schema/project.schema";

// Re-export route constants for convenience
export type { ProjectView } from "./routes";
export {
  PAGE_ROUTES,
  PROJECT_VIEWS,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
} from "./routes";

// Re-export error code constants for convenience
export type { AuthErrorCode, RepositoryErrorCode } from "./errorCodes";
export { AUTH_ERROR_CODES, REPOSITORY_ERROR_CODES } from "./errorCodes";

// Re-export app-level constants
export { APP_LIMITS, STORAGE_KEYS } from "./app";

// Re-export types derived from app-level constants
export type { PaginationLimits, PasswordLimits, StorageKey } from "./app.types";
