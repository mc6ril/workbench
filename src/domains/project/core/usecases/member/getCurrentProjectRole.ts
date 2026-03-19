import type { MemberRepository } from "@/domains/project/core/ports/memberRepository";
import { GetProjectInputSchema } from "@/domains/workspace/core/domain/schema/project.schema";

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
