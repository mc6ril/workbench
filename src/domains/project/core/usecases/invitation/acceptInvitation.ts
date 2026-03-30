import type {
  AcceptedProjectInvitation,
  ProjectInvitationGateway,
} from "@/domains/project/core/ports/project-invitation.gateway";

/**
 * Accept a project invitation using its token.
 * The RPC function handles all validation (token, expiry),
 * adds the user to project_members, and removes the consumed invitation row.
 *
 * @param repository - Invitation repository
 * @param token - Invitation token
 * @returns Project ID, name, and assigned role
 * @throws Error if token is invalid or expired
 */
export const acceptInvitation = async (
  gateway: ProjectInvitationGateway,
  token: string
): Promise<AcceptedProjectInvitation> => {
  return gateway.accept(token);
};
