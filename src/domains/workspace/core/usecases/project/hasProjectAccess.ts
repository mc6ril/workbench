import type { WorkspaceProjectCatalogGateway } from "@/domains/workspace/core/ports/workspace-project-catalog.gateway";

/**
 * Check if the current user has access to any project.
 * Uses optimized SQL function for lightweight boolean check without loading project data.
 *
 * @param gateway - Workspace project catalog gateway
 * @returns True if user has access to at least one project, false otherwise
 * @throws DatabaseError if database operation fails
 */
export const hasProjectAccess = async (
  gateway: WorkspaceProjectCatalogGateway
): Promise<boolean> => {
  return gateway.hasProjectAccess();
};
