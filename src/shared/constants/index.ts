import type { ProjectRole } from "@/core/domain/project/project.schema";

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
export {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  APP_ROUTES,
  isPublicRoute,
  isProtectedRoute,
  isAppRoute,
} from "./routes";
