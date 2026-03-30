import type { ProjectInvitationGateway } from "@/domains/project/core/ports/project-invitation.gateway";

/**
 * Decline a project invitation using its token.
 *
 * @param repository - Invitation repository
 * @param token - Invitation token
 * @throws Error if token is invalid or invitation is not pending
 */
export const declineInvitation = async (
  gateway: ProjectInvitationGateway,
  token: string
): Promise<void> => {
  return gateway.decline(token);
};
