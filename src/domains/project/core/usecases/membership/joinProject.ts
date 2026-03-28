import {
  AddUserToProjectInputSchema,
  type Project,
  ProjectRole,
} from "@/domains/project/core/domain/schema/project.schema";
import type { MemberRepository } from "@/domains/project/core/ports/memberRepository";

/**
 * Reclaim an orphaned project for the current authenticated user.
 * Validates the target project ID and delegates reclaim authorization to the
 * project member repository.
 *
 * @param repository - Member repository
 * @param projectId - Project ID to reclaim
 * @param role - Requested role (default: viewer)
 * @returns The reclaimed project
 */
export const joinProject = async (
  repository: MemberRepository,
  projectId: string,
  role: ProjectRole = ProjectRole.VIEWER
): Promise<Project> => {
  const { projectId: validatedProjectId } = AddUserToProjectInputSchema.parse({
    projectId,
  });

  return repository.addCurrentUserAsMember(validatedProjectId, role);
};
