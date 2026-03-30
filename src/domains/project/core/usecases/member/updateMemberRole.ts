import { z } from "zod";

import { createDomainRuleError } from "@/shared/errors/domainRuleError";

import { ProjectRole } from "@/domains/project/core/domain/project.types";
import type { ProjectMemberGateway } from "@/domains/project/core/ports/project-member.gateway";

const UpdateMemberRoleInputSchema = z.object({
  projectId: z.string().uuid(),
  memberId: z.string().uuid(),
  role: z.nativeEnum(ProjectRole),
});

/**
 * Update a project member's role.
 * Validates input, ensures the current user is an admin, and delegates
 * row-level invariant enforcement to the database layer.
 *
 * Business rules:
 * - Only admins can change roles
 * - The database prevents demoting the last admin of a project
 *
 * @param repository - Member repository
 * @param projectId - ID of the project that owns the member row
 * @param memberId - ID of the project_members row
 * @param role - New role to assign
 * @throws ZodError if input is invalid
 * @throws DomainRuleError if the current user is not an admin of the project
 * @throws DatabaseError if database operation fails
 */
export const updateMemberRole = async (
  gateway: ProjectMemberGateway,
  projectId: string,
  memberId: string,
  role: ProjectRole
): Promise<void> => {
  const parsed = UpdateMemberRoleInputSchema.parse({ projectId, memberId, role });

  const currentRole = await gateway.getCurrentRole(parsed.projectId);

  if (currentRole !== ProjectRole.ADMIN) {
    throw createDomainRuleError(
      "MEMBER_ROLE_CHANGE_ADMIN_REQUIRED",
      "Only project administrators can change a member role"
    );
  }

  return gateway.updateRole(parsed.memberId, parsed.role);
};
