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
  "/auth/signin",
  "/auth/signup",
  "/auth/verify-email",
  "/auth/reset-password",
  "/auth/update-password",
  "/legal",
  "/pricing",
]);

/**
 * Named page route paths for authenticated pages.
 * Use these constants instead of hardcoded path strings.
 */
export const PAGE_ROUTES = Object.freeze({
  WORKSPACE: "/workspace",
  ACCOUNT: "/account",
  LEGAL: "/legal",
  PRICING: "/pricing",
});

/**
 * Protected routes that require authentication.
 * These routes are protected by middleware and require a valid session.
 * Includes /workspace, /account, and all project-specific routes (/{projectId}/...)
 */
export const PROTECTED_ROUTES: readonly string[] = Object.freeze([
  PAGE_ROUTES.WORKSPACE,
  PAGE_ROUTES.ACCOUNT,
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

/**
 * Auth page route paths.
 * Used for redirects after auth operations (e.g., password reset redirect).
 */
export const AUTH_PAGE_ROUTES = Object.freeze({
  UPDATE_PASSWORD: "/auth/update-password",
});

/**
 * API route paths for server-side operations.
 * Used by client-side hooks to call API routes for admin-privileged operations.
 */
export const API_ROUTES = Object.freeze({
  AUTH: Object.freeze({
    DELETE_USER: "/api/auth/delete-user",
  }),
});
