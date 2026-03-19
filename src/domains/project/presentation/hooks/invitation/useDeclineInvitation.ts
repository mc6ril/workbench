import { useMutation, useQueryClient } from "@tanstack/react-query";

import { declineInvitation } from "@/domains/project/core/usecases/invitation/declineInvitation";

import { invitationRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

/**
 * Hook for declining a project invitation.
 * Invalidates pending invitations query on success.
 *
 * @returns Mutation object
 */
export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      declineInvitation(invitationRepository, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invitations.pending(),
      });
    },
  });
};
