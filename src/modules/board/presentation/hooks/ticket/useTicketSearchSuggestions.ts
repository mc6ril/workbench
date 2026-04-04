import { useQuery } from "@tanstack/react-query";

import type { TicketSearchItem } from "@/modules/board/core/domain/ticket.types";
import { listTicketSearchSuggestions } from "@/modules/board/core/usecases/ticket/listTicketSearchSuggestions";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

export const useTicketSearchSuggestions = (
  projectId: string,
  search: string,
  options?: {
    enabled?: boolean;
    limit?: number;
  }
) => {
  const limit = options?.limit ?? 6;

  return useQuery<TicketSearchItem[]>({
    queryKey: queryKeys.projects.ticketSearchSuggestions(
      projectId,
      search,
      limit
    ),
    queryFn: () =>
      listTicketSearchSuggestions(ticketRepository, projectId, search, limit),
    enabled: !!projectId && (options?.enabled ?? true),
  });
};
