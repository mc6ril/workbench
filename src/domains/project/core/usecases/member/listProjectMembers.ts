import type { ProjectMember } from "@/domains/project/core/domain/project.types";
import type { ProjectMemberGateway } from "@/domains/project/core/ports/project-member.gateway";

/**
 * List all members of a project with their profile information.
 * Members are ordered by role (admin first) then by creation date.
 *
 * @param repository - Member repository
 * @param projectId - Project to list members for
 * @returns Array of project members with profiles
 * @throws DatabaseError if database operation fails
 */
export const listProjectMembers = async (
  gateway: ProjectMemberGateway,
  projectId: string
): Promise<ProjectMember[]> => {
  return gateway.listByProject(projectId);
};
