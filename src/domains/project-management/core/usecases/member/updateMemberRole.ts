import { UpdateMemberRoleInputSchema } from "@/domains/project-management/core/domain/schema/projectMember.schema";

import type { MemberRepository } from "@/domains/project-management/core/ports/memberRepository";
import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

/**
 * Update a project member's role.
 * Validates input and delegates invariant enforcement to the database layer.
 *
 * Business rules:
 * - Only admins can change roles (enforced by RLS)
 * - The database prevents demoting the last admin of a project
 *
 * @param repository - Member repository
 * @param memberId - ID of the project_members row
 * @param role - New role to assign
 * @throws ZodError if input is invalid
 * @throws DatabaseError if database operation fails
 */
export const updateMemberRole = async (
  repository: MemberRepository,
  memberId: string,
  role: ProjectRole
): Promise<void> => {
  UpdateMemberRoleInputSchema.parse({ memberId, role });

  return repository.updateRole(memberId, role);
};
