import { RemoveMemberInputSchema } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { MemberRepository } from "@/domains/project/core/ports/memberRepository";

/**
 * Remove a member from a project.
 * Validates input and delegates invariant enforcement to the database layer.
 *
 * Business rules:
 * - Only admins can remove members (enforced by RLS)
 * - The database prevents removing the last admin of a project
 * - If this was the last member, the orphaned project trigger will fire
 *
 * @param repository - Member repository
 * @param memberId - ID of the project_members row
 * @throws ZodError if input is invalid
 * @throws DatabaseError if database operation fails
 */
export const removeMember = async (
  repository: MemberRepository,
  memberId: string
): Promise<void> => {
  RemoveMemberInputSchema.parse({ memberId });

  return repository.remove(memberId);
};
