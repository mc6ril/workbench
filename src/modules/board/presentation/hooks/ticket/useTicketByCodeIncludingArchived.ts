import { useQuery } from "@tanstack/react-query";

import { getTicketByCodeInProjectIncludingArchived } from "@/modules/board/core/usecases/ticket/getTicketByCodeInProjectIncludingArchived";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

export const useTicketByCodeIncludingArchived = (
  projectId: string,
  codeNumber: number | null,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey:
      codeNumber == null
        ? ["tickets", "by-code", "including-archived", projectId, null]
        : queryKeys.tickets.byCodeInProjectIncludingArchived(
            projectId,
            codeNumber
          ),
    queryFn: () => {
      if (codeNumber == null) {
        return Promise.resolve(null);
      }

      return getTicketByCodeInProjectIncludingArchived(ticketRepository, {
        projectId,
        codeNumber,
      });
    },
    enabled:
      Boolean(projectId) && codeNumber != null && (options?.enabled ?? true),
  });
};
