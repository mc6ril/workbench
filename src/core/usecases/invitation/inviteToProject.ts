import {
  getFeatureLimit,
  PlanFeature,
} from "@/core/domain/rules/planFeatures.rules";
import {
  type CreateInvitationInput,
  CreateInvitationInputSchema,
  type ProjectInvitation,
} from "@/core/domain/schema/invitation.schema";
import type { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import type { InvitationRepository } from "@/core/ports/invitationRepository";
import type { MemberRepository } from "@/core/ports/memberRepository";

/**
 * Invite a user to join a project.
 * Validates input and enforces plan limits (current members + pending invitations).
 *
 * Business rules:
 * - Only admins can invite (enforced by RLS)
 * - Cannot exceed MEMBERS_PER_WORKSPACE plan limit
 * - Cannot invite someone already in the project
 * - One pending invitation per (project, email)
 *
 * @param invitationRepo - Invitation repository
 * @param memberRepo - Member repository (for counting current members)
 * @param input - Invitation details (projectId, email, role)
 * @param currentPlan - Current subscription plan (for limit checking)
 * @throws ZodError if input is invalid
 * @throws Error if plan limit would be exceeded
 * @throws ConstraintError if invitation already exists
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
      throw new Error(
        `Cannot invite: workspace member limit reached (${limit})`
      );
    }
  }

  return invitationRepo.create(parsed);
};
