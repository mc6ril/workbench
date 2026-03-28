import { useMutation } from "@tanstack/react-query";

import { declineInvitation } from "@/domains/project/core/usecases/invitation/declineInvitation";
import { invitationRepository } from "@/domains/project/infrastructure/supabase/repositories";

/**
 * Hook for declining a project invitation.
 * Keeps invitation mutations centralized around the token flow.
 *
 * @returns Mutation object
 */
export const useDeclineInvitation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      declineInvitation(invitationRepository, token),
  });
};
