import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptInvitation } from "@/domains/project-management/core/usecases/invitation/acceptInvitation";

import { invitationRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

/**
 * Hook for accepting a project invitation.
 * Invalidates pending invitations and projects queries on success.
 *
 * @returns Mutation object
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      acceptInvitation(invitationRepository, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invitations.pending(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.withStats(),
      });
    },
  });
};
