import type { WorkspaceProjectCatalogRepository } from "@/domains/workspace/core/ports/workspaceProjectCatalogRepository";

/**
 * Check if the current user has access to any project.
 * Uses optimized SQL function for lightweight boolean check without loading project data.
 *
 * @param repository - Project repository
 * @returns True if user has access to at least one project, false otherwise
 * @throws DatabaseError if database operation fails
 */
export const hasProjectAccess = async (
  repository: WorkspaceProjectCatalogRepository
): Promise<boolean> => {
  return repository.hasAnyProjectAccess();
};
