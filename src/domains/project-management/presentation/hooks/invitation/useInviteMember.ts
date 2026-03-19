import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateInvitationInput } from "@/domains/project-management/core/domain/schema/invitation.schema";

import { inviteToProject } from "@/domains/project-management/core/usecases/invitation/inviteToProject";

import type { SubscriptionPlan } from "@/domains/billing/core/domain/schema/subscription.schema";
import {
  invitationRepository,
  memberRepository,
} from "@/domains/project-management/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

/**
 * Hook for creating a project invitation link.
 * Invalidates the project invitations query on success.
 *
 * @returns Mutation object
 */
export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      currentPlan,
    }: {
      input: CreateInvitationInput;
      currentPlan: SubscriptionPlan;
    }) =>
      inviteToProject(
        invitationRepository,
        memberRepository,
        input,
        currentPlan
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invitations.byProject(variables.input.projectId),
      });
    },
  });
};
