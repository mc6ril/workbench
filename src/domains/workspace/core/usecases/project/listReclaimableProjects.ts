import type { ReclaimableProject } from "@/domains/workspace/core/domain/workspace.types";
import type { WorkspaceProjectCatalogGateway } from "@/domains/workspace/core/ports/workspace-project-catalog.gateway";

/**
 * List orphaned projects that the current user can reclaim.
 * Projects become orphaned when their last member deletes their account.
 * Matching is done server-side by comparing orphaned_by_email
 * with the current user's email.
 *
 * @param gateway - Workspace project catalog gateway
 * @returns Array of reclaimable projects (empty if none found)
 */
export const listReclaimableProjects = async (
  gateway: WorkspaceProjectCatalogGateway
): Promise<ReclaimableProject[]> => {
  return gateway.listReclaimableProjects();
};
