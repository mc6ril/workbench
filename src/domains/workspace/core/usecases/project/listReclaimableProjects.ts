import type { ReclaimableProject } from "@/domains/workspace/core/domain/schema/workspaceProject.schema";
import type { WorkspaceProjectRepository } from "@/domains/workspace/core/ports/projectRepository";

/**
 * List orphaned projects that the current user can reclaim.
 * Projects become orphaned when their last member deletes their account.
 * Matching is done server-side by comparing orphaned_by_email
 * with the current user's email.
 *
 * @param projectRepository - Project repository
 * @returns Array of reclaimable projects (empty if none found)
 */
export const listReclaimableProjects = async (
  projectRepository: WorkspaceProjectRepository
): Promise<ReclaimableProject[]> => {
  return projectRepository.listReclaimableProjects();
};
