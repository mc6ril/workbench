import type { InvitationRepository } from "@/domains/project/core/ports/invitationRepository";

/**
 * Accept a project invitation using its token.
 * The RPC function handles all validation (token, expiry, email matching)
 * and adds the user to project_members.
 *
 * @param repository - Invitation repository
 * @param token - Invitation token
 * @returns Project ID, name, and assigned role
 * @throws Error if token is invalid, expired, or email doesn't match
 */
export const acceptInvitation = async (
  repository: InvitationRepository,
  token: string
): Promise<{ projectId: string; projectName: string; role: string }> => {
  return repository.accept(token);
};
