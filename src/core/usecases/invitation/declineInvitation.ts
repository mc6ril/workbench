import type { InvitationRepository } from "@/core/ports/invitationRepository";

/**
 * Decline a project invitation using its token.
 *
 * @param repository - Invitation repository
 * @param token - Invitation token
 * @throws Error if token is invalid or invitation is not pending
 */
export const declineInvitation = async (
  repository: InvitationRepository,
  token: string
): Promise<void> => {
  return repository.decline(token);
};
