import { useMutation, useQueryClient } from "@tanstack/react-query";

import { revokeInvitation } from "@/domains/project/core/usecases/invitation/revokeInvitation";
import { projectInvitationGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

type RevokeInvitationVariables = {
  invitationId: string;
  projectId: string;
};

/**
 * Hook for revoking a project invitation link and refreshing invitation lists.
 */
export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId }: RevokeInvitationVariables) =>
      revokeInvitation(projectInvitationGateway, invitationId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invitations.byProject(variables.projectId),
      });
    },
  });
};
