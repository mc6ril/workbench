import type {
  ProjectInvitation,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";

export type AcceptedProjectInvitation = {
  projectId: string;
  projectName: string;
  role: ProjectRole;
};

/**
 * Gateway contract for project invitation operations.
 *
 * Invitations use token-based acceptance (no login required to view the invite page,
 * but authentication is required to accept).
 *
 * Invariants:
 * - Only admins can create, revoke invitations (enforced by RLS)
 * - Invitations expire after 7 days
 * - Accepting an invitation adds the user to project_members
 */
export type ProjectInvitationGateway = {
  /**
   * List invitations currently stored for a project.
   * @returns Invitations ordered by creation date (newest first)
   * @throws DatabaseError if database operation fails
   */
  listByProject(projectId: string): Promise<ProjectInvitation[]>;

  /**
   * Create a new invitation link for a project.
   * @throws DatabaseError if database operation fails or permission denied
   */
  create(input: { projectId: string; role: ProjectRole }): Promise<ProjectInvitation>;

  /**
   * Accept a pending invitation using its token.
   * Adds the user to project_members and removes the consumed invitation row.
   * @returns Project ID, name, and assigned role
   * @throws NotFoundError if token is invalid or invitation is not pending
   * @throws Error if invitation has expired
   */
  accept(token: string): Promise<AcceptedProjectInvitation>;

  /**
   * Decline a pending invitation using its token.
   * @throws NotFoundError if token is invalid or invitation is not pending
   */
  decline(token: string): Promise<void>;

  /**
   * Revoke (delete) an invitation. Only admins can revoke.
   * @throws DatabaseError if database operation fails or permission denied
   */
  revoke(invitationId: string): Promise<void>;

  /**
   * Count pending invitations for a project.
   * Used for plan limit enforcement (members + pending invitations).
   * @returns Number of pending invitations
   */
  countPending(projectId: string): Promise<number>;
};
