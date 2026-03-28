import type { Project } from "@/domains/project/core/domain/schema/project.schema";
import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";

/**
 * Repository contract for project member operations.
 *
 * Members are linked to projects via the project_members table.
 * RLS policies enforce that only admins can modify membership.
 *
 * Invariants:
 * - A project must always have at least one admin
 * - Each user can only have one role per project
 * - Role changes and removals require admin permission
 */
export type MemberRepository = {
  /**
   * Reclaim an orphaned project for the current authenticated user.
   * Uses the database RPC that validates reclaim eligibility server-side.
   * @throws NotFoundError if project not found
   * @throws ConstraintError if user is already a member
   * @throws DatabaseError if database operation fails or permission denied
   */
  addCurrentUserAsMember(
    projectId: string,
    role?: ProjectRole
  ): Promise<Project>;

  /**
   * Get current authenticated user's role for a project.
   * Returns null when the user is not a member (or has no access).
   * @throws DatabaseError if database operation fails
   */
  getCurrentRole(projectId: string): Promise<ProjectRole | null>;

  /**
   * List all members of a project with their profile information.
   * Returns members joined with user_profiles for display data.
   * @returns Array of members ordered by role (admin first) then creation date
   * @throws DatabaseError if database operation fails
   */
  listByProject(projectId: string): Promise<ProjectMember[]>;

  /**
   * Update a member's role in a project.
   * @throws NotFoundError if member not found
   * @throws DatabaseError if database operation fails or permission denied
   */
  updateRole(memberId: string, role: ProjectRole): Promise<void>;

  /**
   * Remove a member from a project.
   * Cascade effects: ticket assignments in that project are removed for the user,
   * and the orphaned project trigger may fire if this is the last member.
   * @throws NotFoundError if member not found
   * @throws DatabaseError if database operation fails or permission denied
   */
  remove(memberId: string): Promise<void>;

  /**
   * Count the number of admins in a project.
   * Used to prevent removing the last admin.
   * @returns Number of members with admin role
   * @throws DatabaseError if database operation fails
   */
  countAdmins(projectId: string): Promise<number>;
};
