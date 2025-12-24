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
