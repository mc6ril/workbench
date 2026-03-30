import { z } from "zod";

import type { ProjectMemberGateway } from "@/domains/project/core/ports/project-member.gateway";

const RemoveMemberInputSchema = z.object({
  memberId: z.string().uuid(),
});

/**
 * Remove a member from a project.
 * Validates input and delegates invariant enforcement to the database layer.
 *
 * Business rules:
 * - Only admins can remove members (enforced by RLS)
 * - The database prevents removing the last admin of a project
 * - The database removes that user's ticket assignments for the same project
 * - If this was the last member, the orphaned project trigger will fire
 *
 * @param repository - Member repository
 * @param memberId - ID of the project_members row
 * @throws ZodError if input is invalid
 * @throws DatabaseError if database operation fails
 */
export const removeMember = async (
  gateway: ProjectMemberGateway,
  memberId: string
): Promise<void> => {
  RemoveMemberInputSchema.parse({ memberId });

  return gateway.remove(memberId);
};
