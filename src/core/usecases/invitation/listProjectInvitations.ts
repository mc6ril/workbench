import type { ProjectInvitation } from "@/core/domain/schema/invitation.schema";

import type { InvitationRepository } from "@/core/ports/invitationRepository";

/**
 * List all invitations for a project (all statuses).
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
