import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptInvitation } from "@/domains/project/core/usecases/invitation/acceptInvitation";
import { projectInvitationGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

/**
 * Hook for accepting a project invitation.
 * Invalidates project queries on success.
 *
 * @returns Mutation object
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      acceptInvitation(projectInvitationGateway, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(),
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.projects.withStats(),
      });
    },
  });
};
