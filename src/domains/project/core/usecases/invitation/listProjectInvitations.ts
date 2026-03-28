import type { ProjectInvitation } from "@/domains/project/core/domain/schema/invitation.schema";
import type { InvitationRepository } from "@/domains/project/core/ports/invitationRepository";

/**
 * List invitations currently stored for a project.
 * Requires project membership (enforced by RLS).
 *
 * @param repository - Invitation repository
 * @param projectId - Project to list invitations for
 * @returns Invitations ordered by creation date (newest first)
 */
export const listProjectInvitations = async (
  repository: InvitationRepository,
  projectId: string
): Promise<ProjectInvitation[]> => {
  return repository.listByProject(projectId);
};
