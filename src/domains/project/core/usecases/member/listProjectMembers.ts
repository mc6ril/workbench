import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";

import type { MemberRepository } from "@/domains/project/core/ports/memberRepository";

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
  repository: MemberRepository,
  projectId: string
): Promise<ProjectMember[]> => {
  return repository.listByProject(projectId);
};
