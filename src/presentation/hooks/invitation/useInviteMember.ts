import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateInvitationInput } from "@/core/domain/schema/invitation.schema";
import type { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import { inviteToProject } from "@/core/usecases/invitation/inviteToProject";

import {
  invitationRepository,
  memberRepository,
} from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

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
