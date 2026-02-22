import { RemoveMemberInputSchema } from "@/core/domain/schema/projectMember.schema";

import type { MemberRepository } from "@/core/ports/memberRepository";

/**
 * Remove a member from a project.
 * Validates input and prevents removing the last admin.
 *
 * Business rules:
 * - Only admins can remove members (enforced by RLS)
 * - Cannot remove the last admin of a project
 * - If this was the last member, the orphaned project trigger will fire
 *
 * @param repository - Member repository
 * @param memberId - ID of the project_members row
 * @param projectId - Project ID (needed to check admin count)
 * @param memberRole - Role of the member being removed
 * @throws ZodError if input is invalid
 * @throws Error if trying to remove the last admin
 * @throws DatabaseError if database operation fails
 */
export const removeMember = async (
  repository: MemberRepository,
  memberId: string,
  projectId: string,
  memberRole: string
): Promise<void> => {
  RemoveMemberInputSchema.parse({ memberId });

  if (memberRole === "admin") {
    const adminCount = await repository.countAdmins(projectId);
    if (adminCount <= 1) {
      throw new Error("Cannot remove the last admin of a project");
    }
  }

  return repository.remove(memberId);
};
