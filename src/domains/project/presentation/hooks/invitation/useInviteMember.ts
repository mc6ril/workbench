import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import {
  inviteToProject,
  type InviteToProjectInput,
} from "@/domains/project/core/usecases/invitation/inviteToProject";
import {
  projectInvitationGateway,
  projectMemberGateway,
} from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

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
      input: InviteToProjectInput;
      currentPlan: SubscriptionPlan;
    }) =>
      inviteToProject(
        projectInvitationGateway,
        projectMemberGateway,
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
