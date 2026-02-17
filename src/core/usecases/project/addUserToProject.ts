import {
  AddUserToProjectInputSchema,
  type Project,
  ProjectRole,
} from "@/core/domain/schema/project.schema";

import type { ProjectRepository } from "@/core/ports/projectRepository";

/**
 * Add the current user to a project as a member.
 * Validates the project ID and adds the user.
 * Note: Users can only self-add as 'viewer'. Admins can add users with any role.
 *
 * @param projectRepository - Project repository
 * @param projectId - Project ID to add user to (UUID)
 * @param role - Role to assign (default: ProjectRole.VIEWER)
 * @returns The project the user was added to
 * @throws ZodError if projectId is not a valid UUID
 * @throws NotFoundError if project doesn't exist
 * @throws ConstraintError if user is already a member
 * @throws DatabaseError if adding user fails or permission denied
 */
export const addUserToProject = async (
  projectRepository: ProjectRepository,
  projectId: string,
  role: ProjectRole = ProjectRole.VIEWER
): Promise<Project> => {
  const { projectId: validatedProjectId } = AddUserToProjectInputSchema.parse({
    projectId,
  });

  return projectRepository.addCurrentUserAsMember(validatedProjectId, role);
};
