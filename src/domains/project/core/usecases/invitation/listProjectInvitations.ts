import type { ProjectInvitation } from "@/domains/project/core/domain/project.types";
import type { ProjectInvitationGateway } from "@/domains/project/core/ports/project-invitation.gateway";

/**
 * List invitations currently stored for a project.
 * Requires project membership (enforced by RLS).
 *
 * @param repository - Invitation repository
 * @param projectId - Project to list invitations for
 * @returns Invitations ordered by creation date (newest first)
 */
export const listProjectInvitations = async (
  gateway: ProjectInvitationGateway,
  projectId: string
): Promise<ProjectInvitation[]> => {
  return gateway.listByProject(projectId);
};
