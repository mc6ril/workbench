import { z } from "zod";

import {
  type Project,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";
import type { ProjectMemberGateway } from "@/domains/project/core/ports/project-member.gateway";

const JoinProjectInputSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID"),
  role: z.nativeEnum(ProjectRole).optional(),
});

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
  gateway: ProjectMemberGateway,
  projectId: string,
  role: ProjectRole = ProjectRole.VIEWER
): Promise<Project> => {
  const parsed = JoinProjectInputSchema.parse({
    projectId,
    role,
  });

  return gateway.addCurrentUserAsMember(
    parsed.projectId,
    parsed.role ?? ProjectRole.VIEWER
  );
};
