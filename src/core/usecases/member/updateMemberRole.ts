import { ProjectRole } from "@/core/domain/schema/project.schema";
import { UpdateMemberRoleInputSchema } from "@/core/domain/schema/projectMember.schema";

import type { MemberRepository } from "@/core/ports/memberRepository";

/**
 * Update a project member's role.
 * Validates input and prevents demoting the last admin.
 *
 * Business rules:
 * - Only admins can change roles (enforced by RLS)
 * - Cannot demote the last admin of a project
 *
 * @param repository - Member repository
 * @param memberId - ID of the project_members row
 * @param role - New role to assign
 * @param projectId - Project ID (needed to check admin count)
 * @throws ZodError if input is invalid
 * @throws Error if trying to demote the last admin
 * @throws DatabaseError if database operation fails
 */
export const updateMemberRole = async (
  repository: MemberRepository,
  memberId: string,
  role: ProjectRole,
  projectId: string
): Promise<void> => {
  UpdateMemberRoleInputSchema.parse({ memberId, role });

  if (role !== ProjectRole.ADMIN) {
    const adminCount = await repository.countAdmins(projectId);
    if (adminCount <= 1) {
      throw new Error("Cannot demote the last admin of a project");
    }
  }

  return repository.updateRole(memberId, role);
};
