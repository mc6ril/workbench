import { GetProjectInputSchema } from "@/core/domain/schema/project.schema";

import type { MemberRepository } from "@/core/ports/memberRepository";

/**
 * Get current authenticated user's role for a project.
 * Returns null when the user is not a member.
 */
export const getCurrentProjectRole = async (
  repository: MemberRepository,
  projectId: string
) => {
  GetProjectInputSchema.parse({ id: projectId });
  return repository.getCurrentRole(projectId);
};
