import type { ProjectWithRole } from "@/domains/project/core/domain/schema/project.schema";
import type { WorkspaceProjectCatalogRepository } from "@/domains/workspace/core/ports/workspaceProjectCatalogRepository";

/**
 * List all projects accessible to the current user with their roles.
 * RLS policies automatically filter projects to only those where user is a member.
 *
 * @param repository - Project repository
 * @returns Array of projects with role information accessible to the user
 * @throws DatabaseError if database operation fails
 */
export const listProjects = async (
  repository: WorkspaceProjectCatalogRepository
): Promise<ProjectWithRole[]> => {
  return repository.listAccessibleProjects();
};
