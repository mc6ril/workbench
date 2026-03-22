import type {
  Project,
  ProjectRole,
} from "@/domains/project/core/domain/schema/project.schema";
import type {
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/schema/workspaceProject.schema";

/**
 * Repository contract for workspace-owned project catalog operations.
 * Hides infrastructure details and exposes domain-shaped operations used by the workspace shell.
 */
export type WorkspaceProjectRepository = {
  /**
   * Get all projects accessible to the current user with their roles and stats.
   * Uses optimized SQL function for aggregated counts (member count, ticket counts).
   * @returns Array of projects with role and statistics
   * @throws DatabaseError if database operation fails
   */
  listWithStats(): Promise<ProjectWithStats[]>;

  /**
   * Add current user to a project as a member.
   * @param projectId - Project ID
   * @param role - Role to assign (default: 'viewer'). Note: Users can only self-add as 'viewer'. Admins can add with any role.
   * @returns The project the user was added to
   * @throws NotFoundError if project not found
   * @throws ConstraintError if user is already a member
   * @throws DatabaseError if database operation fails or permission denied
   */
  addCurrentUserAsMember(
    projectId: string,
    role?: ProjectRole
  ): Promise<Project>;

  /**
   * Check if the current user has access to any project.
   * Uses optimized SQL function for lightweight boolean check.
   * @returns True if user has access to at least one project, false otherwise
   * @throws DatabaseError if database operation fails
   */
  hasProjectAccess(): Promise<boolean>;

  /**
   * List orphaned projects reclaimable by the current user.
   * Matches creator_email against the current user's email.
   * @returns Array of reclaimable projects (may be empty)
   * @throws DatabaseError if database operation fails
   */
  listReclaimableProjects(): Promise<ReclaimableProject[]>;
};
