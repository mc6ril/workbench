import { z } from "zod";

import type { ProjectMemberGateway } from "@/domains/project/core/ports/project-member.gateway";

const GetCurrentProjectRoleInputSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID"),
});

/**
 * Get current authenticated user's role for a project.
 * Returns null when the user is not a member.
 */
export const getCurrentProjectRole = async (
  gateway: ProjectMemberGateway,
  projectId: string
) => {
  GetCurrentProjectRoleInputSchema.parse({ projectId });
  return gateway.getCurrentRole(projectId);
};
