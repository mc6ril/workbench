import { useQuery } from "@tanstack/react-query";

import { getTicketLabelIds } from "@/modules/board/core/usecases/label";

import { labelRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for fetching label IDs attached to a ticket.
 */
export const useTicketLabelIds = (ticketId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.labels.byTicket(ticketId ?? ""),
    queryFn: () => getTicketLabelIds(ticketId!, labelRepository),
    enabled: !!ticketId,
  });
};
