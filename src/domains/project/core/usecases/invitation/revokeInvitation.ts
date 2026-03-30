import type { ProjectInvitationGateway } from "@/domains/project/core/ports/project-invitation.gateway";

/**
 * Revoke (delete) a pending invitation.
 * Only project admins can revoke invitations (enforced by RLS).
 *
 * @param repository - Invitation repository
 * @param invitationId - ID of the invitation to revoke
 * @throws DatabaseError if operation fails or permission denied
 */
export const revokeInvitation = async (
  gateway: ProjectInvitationGateway,
  invitationId: string
): Promise<void> => {
  return gateway.revoke(invitationId);
};
