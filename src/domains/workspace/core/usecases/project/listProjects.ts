import type { ProjectWithRole } from "@/domains/project/core/domain/project.types";
import type { WorkspaceProjectCatalogGateway } from "@/domains/workspace/core/ports/workspace-project-catalog.gateway";

/**
 * List all projects accessible to the current user with their roles.
 * RLS policies automatically filter projects to only those where user is a member.
 *
 * @param gateway - Workspace project catalog gateway
 * @returns Array of projects with role information accessible to the user
 * @throws DatabaseError if database operation fails
 */
export const listProjects = async (
  gateway: WorkspaceProjectCatalogGateway
): Promise<ProjectWithRole[]> => {
  return gateway.listProjects();
};
