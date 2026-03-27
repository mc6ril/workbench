/**
 * Route constants for the application.
 * Used for route matching, redirects, and navigation logic.
 */

/**
 * Named page route paths for authenticated pages.
 * Use these constants instead of hardcoded path strings.
 */
export const PAGE_ROUTES = Object.freeze({
  HOME: "/",
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
 * where projectId is a UUID and view can be: board, settings, etc.
 */
export const PROJECT_VIEWS = Object.freeze({
  BOARD: "board",
  SETTINGS: "settings",
});

export type ProjectView = (typeof PROJECT_VIEWS)[keyof typeof PROJECT_VIEWS];

/**
 * Auth page route paths.
 * Used for redirects after auth operations (e.g., password reset redirect).
 */
export const AUTH_PAGE_ROUTES = Object.freeze({
  SIGNIN: "/auth/signin",
  SIGNUP: "/auth/signup",
  VERIFY_EMAIL: "/auth/verify-email",
  RESET_PASSWORD: "/auth/reset-password",
  CALLBACK: "/auth/callback",
  UPDATE_PASSWORD: "/auth/update-password",
});

/**
 * Public routes that don't require authentication.
 * These routes are accessible without a session.
 */
export const PUBLIC_ROUTES: readonly string[] = Object.freeze([
  PAGE_ROUTES.HOME,
  AUTH_PAGE_ROUTES.SIGNIN,
  AUTH_PAGE_ROUTES.SIGNUP,
  AUTH_PAGE_ROUTES.VERIFY_EMAIL,
  AUTH_PAGE_ROUTES.RESET_PASSWORD,
  AUTH_PAGE_ROUTES.UPDATE_PASSWORD,
  AUTH_PAGE_ROUTES.CALLBACK,
  PAGE_ROUTES.LEGAL,
  PAGE_ROUTES.PRICING,
]);

/**
 * API route paths for server-side operations.
 * Used by client-side hooks to call API routes for admin-privileged operations.
 */
export const API_ROUTES = Object.freeze({
  AUTH: Object.freeze({
    DELETE_USER: "/api/auth/delete-user",
  }),
});
