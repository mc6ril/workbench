import type { PendingInvitation } from "@/domains/project-management/core/domain/schema/invitation.schema";

import type { InvitationRepository } from "@/domains/project-management/core/ports/invitationRepository";

/**
 * List pending invitations for the current user.
 * Matches invitations by the user's email address.
 *
 * @param repository - Invitation repository
 * @returns Pending invitations with project info, ordered by creation date
 */
export const listPendingInvitations = async (
  repository: InvitationRepository
): Promise<PendingInvitation[]> => {
  return repository.listPendingForCurrentUser();
};
