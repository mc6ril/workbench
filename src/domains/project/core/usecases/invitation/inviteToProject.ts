import { z } from "zod";

import { createDomainRuleError } from "@/shared/errors/domainRuleError";

import {
  getFeatureLimit,
  PlanFeature,
} from "@/domains/billing/core/domain/planFeatures.rules";
import type { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import {
  type ProjectInvitation,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";
import type { ProjectInvitationGateway } from "@/domains/project/core/ports/project-invitation.gateway";
import type { ProjectMemberGateway } from "@/domains/project/core/ports/project-member.gateway";

export const InviteToProjectInputSchema = z.object({
  projectId: z.string().uuid(),
  role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER),
});

export type InviteToProjectInput = z.infer<typeof InviteToProjectInputSchema>;

/**
 * Invite a user to join a project.
 * Validates input and enforces plan limits (current members + pending invitations).
 *
 * Business rules:
 * - Only admins can invite (enforced by RLS)
 * - Cannot exceed MEMBERS_PER_WORKSPACE plan limit
 * - Pending invitation links count against the member limit until consumed or expired
 *
 * @param invitationRepo - Invitation repository
 * @param memberRepo - Member repository (for counting current members)
 * @param input - Invitation details (projectId, role)
 * @param currentPlan - Current subscription plan (for limit checking)
 * @throws ZodError if input is invalid
 * @throws DomainRuleError if plan limit would be exceeded
 */
export const inviteToProject = async (
  invitationGateway: ProjectInvitationGateway,
  memberGateway: ProjectMemberGateway,
  input: InviteToProjectInput,
  currentPlan: SubscriptionPlan
): Promise<ProjectInvitation> => {
  const parsed = InviteToProjectInputSchema.parse(input);

  const limit = getFeatureLimit(currentPlan, PlanFeature.MEMBERS_PER_WORKSPACE);

  // -1 means unlimited
  if (limit !== -1) {
    const currentMembers = await memberGateway.listByProject(parsed.projectId);
    const pendingCount = await invitationGateway.countPending(parsed.projectId);
    const total = currentMembers.length + pendingCount;

    if (total >= limit) {
      throw createDomainRuleError(
        "INVITATION_LIMIT_REACHED",
        `Cannot create invitation link: workspace member limit reached (${limit})`
      );
    }
  }

  return invitationGateway.create(parsed);
};
