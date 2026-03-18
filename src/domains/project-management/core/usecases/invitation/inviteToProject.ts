import { createDomainRuleError } from "@/domains/project-management/core/domain/domainRuleError";
import {
  getFeatureLimit,
  PlanFeature,
} from "@/domains/project-management/core/domain/rules/planFeatures.rules";
import {
  type CreateInvitationInput,
  CreateInvitationInputSchema,
  type ProjectInvitation,
} from "@/domains/project-management/core/domain/schema/invitation.schema";
import type { SubscriptionPlan } from "@/domains/project-management/core/domain/schema/subscription.schema";

import type { InvitationRepository } from "@/domains/project-management/core/ports/invitationRepository";
import type { MemberRepository } from "@/domains/project-management/core/ports/memberRepository";

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
  invitationRepo: InvitationRepository,
  memberRepo: MemberRepository,
  input: CreateInvitationInput,
  currentPlan: SubscriptionPlan
): Promise<ProjectInvitation> => {
  const parsed = CreateInvitationInputSchema.parse(input);

  const limit = getFeatureLimit(currentPlan, PlanFeature.MEMBERS_PER_WORKSPACE);

  // -1 means unlimited
  if (limit !== -1) {
    const currentMembers = await memberRepo.listByProject(parsed.projectId);
    const pendingCount = await invitationRepo.countPending(parsed.projectId);
    const total = currentMembers.length + pendingCount;

    if (total >= limit) {
      throw createDomainRuleError(
        "INVITATION_LIMIT_REACHED",
        `Cannot create invitation link: workspace member limit reached (${limit})`
      );
    }
  }

  return invitationRepo.create(parsed);
};
