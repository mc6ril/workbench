import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "@/shared/constants/routes";

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
 * Protected routes include:
 * - Exact matches in PROTECTED_ROUTES (e.g., /myworkspace)
 * - Project routes following the pattern /{projectId}/{view}
 *
 * @param pathname - The pathname to check
 * @returns True if the pathname is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  // Check exact matches
  if (PROTECTED_ROUTES.includes(pathname)) {
    return true;
  }

  // Check if pathname matches project route pattern: /{projectId}/{view}
  // UUID format: 8-4-4-4-12 hex characters
  const projectRoutePattern =
    /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/([^/]+)(\/.*)?$/i;
  return projectRoutePattern.test(pathname);
}

/**
 * Check if a pathname is a project route.
 * Project routes follow the pattern: /{projectId}/{view}
 *
 * @param pathname - The pathname to check
 * @returns True if the pathname is a project route
 */
export function isProjectRoute(pathname: string): boolean {
  const projectRoutePattern =
    /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/([^/]+)(\/.*)?$/i;
  return projectRoutePattern.test(pathname);
}

/**
 * Extract project ID from a project route pathname.
 *
 * @param pathname - The pathname (e.g., "/abc-123-def/board")
 * @returns The project ID if found, null otherwise
 */
export function extractProjectId(pathname: string): string | null {
  const match = pathname.match(
    /^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  );
  return match ? match[1] : null;
}

/**
 * Extract view name from a project route pathname.
 *
 * @param pathname - The pathname (e.g., "/abc-123-def/board")
 * @returns The view name if found, null otherwise
 */
export function extractProjectView(pathname: string): string | null {
  const match = pathname.match(
    /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/([^/]+)/i
  );
  return match ? match[1] : null;
}

/**
 * Build a project route pathname.
 *
 * @param projectId - The project UUID
 * @param view - The view name (board, backlog, epics, etc.)
 * @returns The route pathname
 */
export function buildProjectRoute(projectId: string, view: string): string {
  return `/${projectId}/${view}`;
}
