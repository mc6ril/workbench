import type { ProjectWithStats } from "@/domains/workspace/core/domain/workspace.types";
import type { WorkspaceProjectCatalogGateway } from "@/domains/workspace/core/ports/workspace-project-catalog.gateway";

/**
 * List all projects accessible to the current user with their roles and statistics.
 * Uses optimized SQL function for aggregated counts (member count, ticket counts).
 *
 * @param gateway - Workspace project catalog gateway
 * @returns Array of projects with role and statistics
 * @throws DatabaseError if database operation fails
 */
export const listProjectsWithStats = async (
  gateway: WorkspaceProjectCatalogGateway
): Promise<ProjectWithStats[]> => {
  return gateway.listProjectsWithStats();
};
