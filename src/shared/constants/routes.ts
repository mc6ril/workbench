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
 */
export const PROTECTED_ROUTES: readonly string[] = Object.freeze([
  "/myworkspace",
  // Future app routes will be added here as needed:
  // "/app/board",
  // "/app/backlog",
  // "/app/epics",
]);

/**
 * Routes that are under the /app/* path pattern.
 * These routes require both authentication and project access.
 */
export const APP_ROUTES: readonly string[] = Object.freeze([
  // Future app routes will be added here:
  // "/app/board",
  // "/app/backlog",
  // "/app/epics",
]);

/**
 * Check if a pathname is a public route.
 *
 * @param pathname - The pathname to check
 * @returns True if the pathname is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

/**
 * Check if a pathname is a protected route.
 *
 * @param pathname - The pathname to check
 * @returns True if the pathname is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  // Check exact matches
  if (PROTECTED_ROUTES.includes(pathname)) {
    return true;
  }

  // Check if pathname starts with /app/
  return pathname.startsWith("/app/");
}

/**
 * Check if a pathname is under the /app/* pattern.
 *
 * @param pathname - The pathname to check
 * @returns True if the pathname is an app route
 */
export function isAppRoute(pathname: string): boolean {
  return pathname.startsWith("/app/");
}
