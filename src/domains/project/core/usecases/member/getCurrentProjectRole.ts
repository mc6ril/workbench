import { z } from "zod";

import type { MemberRepository } from "@/domains/project/core/ports/memberRepository";

const GetCurrentProjectRoleInputSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID"),
});

/**
 * Get current authenticated user's role for a project.
 * Returns null when the user is not a member.
 */
export const getCurrentProjectRole = async (
  repository: MemberRepository,
  projectId: string
) => {
  GetCurrentProjectRoleInputSchema.parse({ projectId });
  return repository.getCurrentRole(projectId);
};
