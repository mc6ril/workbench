import type { Project } from "@/core/domain/schema/project.schema";

import type { ProjectRepository } from "@/core/ports/projectRepository";

/**
 * Add the current user to a project as a member.
 * First checks if the project exists, then adds the user.
 * Note: Users can only self-add as 'viewer'. Admins can add users with any role.
 *
 * @param projectRepository - Project repository
 * @param projectId - Project ID to add user to
 * @param role - Role to assign (default: 'viewer')
 * @returns The project the user was added to
 * @throws NotFoundError if project doesn't exist
 * @throws ConstraintError if user is already a member
 * @throws DatabaseError if adding user fails or permission denied
 */
export const addUserToProject = async (
  projectRepository: ProjectRepository,
  projectId: string,
  role: "admin" | "member" | "viewer" = "viewer"
): Promise<Project> => {
  return projectRepository.addCurrentUserAsMember(projectId, role);
};
