import { useQuery } from "@tanstack/react-query";

import { listPendingInvitations } from "@/domains/project/core/usecases/invitation/listPendingInvitations";

import { invitationRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

/**
 * Hook for fetching pending invitations for the current user.
 * Used to show invitation notifications/banners.
 *
 * @returns React Query hook result with pending invitations array
 */
export const usePendingInvitations = () => {
  return useQuery({
    queryKey: queryKeys.invitations.pending(),
    queryFn: () => listPendingInvitations(invitationRepository),
  });
};
