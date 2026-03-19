import { useQuery } from "@tanstack/react-query";

import { listComments } from "@/modules/board/core/usecases/comment";

import { commentRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for fetching comments for a ticket with author profiles.
 */
export const useComments = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.comments.byTicket(ticketId),
    queryFn: () => listComments(ticketId, commentRepository),
    enabled: !!ticketId,
  });
};
