import type { InvitationRepository } from "@/domains/project-management/core/ports/invitationRepository";

/**
 * Revoke (delete) a pending invitation.
 * Only project admins can revoke invitations (enforced by RLS).
 *
 * @param repository - Invitation repository
 * @param invitationId - ID of the invitation to revoke
 * @throws DatabaseError if operation fails or permission denied
 */
export const revokeInvitation = async (
  repository: InvitationRepository,
  invitationId: string
): Promise<void> => {
  return repository.revoke(invitationId);
};
