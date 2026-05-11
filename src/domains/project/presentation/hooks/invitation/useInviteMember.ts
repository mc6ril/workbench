import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  inviteToProject,
  type InviteToProjectInput,
} from "@/domains/project/core/usecases/invitation/inviteToProject";
import { projectInvitationGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteToProjectInput) =>
      inviteToProject(projectInvitationGateway, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invitations.byProject(variables.projectId),
      });
    },
  });
};
