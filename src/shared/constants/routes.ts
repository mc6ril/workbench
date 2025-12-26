/**
 * Route constants for the application.
 * Used for route matching, redirects, and navigation logic.
 */

/**
 * Public routes that don't require authentication.
 * These routes are accessible without a session.
 */
export const PUBLIC_ROUTES: readonly string[] = Object.freeze([
  "/",
  "/signin",
  "/signup",
]);

/**
 * Protected routes that require authentication.
 * These routes are protected by middleware and require a valid session.
 * Includes /myworkspace and all project-specific routes (/{projectId}/...)
 */
export const PROTECTED_ROUTES: readonly string[] = Object.freeze([
  "/myworkspace",
]);

/**
 * Project route patterns.
 * Project routes follow the pattern: /{projectId}/{view}
 * where projectId is a UUID and view can be: board, backlog, epics, settings, etc.
 */
export const PROJECT_VIEWS = Object.freeze({
  BOARD: "board",
  BACKLOG: "backlog",
  EPICS: "epics",
  SETTINGS: "settings",
});

export type ProjectView = (typeof PROJECT_VIEWS)[keyof typeof PROJECT_VIEWS];
