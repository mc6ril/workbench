import type { ProjectWithStats } from "@/domains/workspace/core/domain/schema/workspaceProjectCatalog.schema";
import type { WorkspaceProjectCatalogRepository } from "@/domains/workspace/core/ports/workspaceProjectCatalogRepository";

/**
 * List all projects accessible to the current user with their roles and statistics.
 * Uses optimized SQL function for aggregated counts (member count, ticket counts).
 *
 * @param repository - Project repository
 * @returns Array of projects with role and statistics
 * @throws DatabaseError if database operation fails
 */
export const listProjectsWithStats = async (
  repository: WorkspaceProjectCatalogRepository
): Promise<ProjectWithStats[]> => {
  return repository.listProjectsWithStats();
};
