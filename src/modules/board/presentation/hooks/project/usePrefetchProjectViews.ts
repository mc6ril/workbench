import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { TicketFilters } from "@/modules/board/core/domain/schema/ticket.schema";
import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";
import { getTicketAssigneesByProjectId } from "@/modules/board/core/usecases/ticket/getTicketAssigneesByProjectId";
import { listTickets } from "@/modules/board/core/usecases/ticket/listTickets";
import {
  boardRepository,
  ticketRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

type UsePrefetchProjectViewsParams = {
  projectId: string;
  filters?: TicketFilters;
  search?: string;
};

export const usePrefetchProjectViews = ({
  projectId,
  filters,
  search,
}: UsePrefetchProjectViewsParams) => {
  const queryClient = useQueryClient();

  const prefetchBoardView = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.boardConfiguration(projectId),
      queryFn: () => getBoardConfiguration(boardRepository, projectId),
    });

    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.ticketsList(projectId, filters, search),
      queryFn: () => listTickets(ticketRepository, projectId, filters, search),
    });

    void queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.assigneesByProjectId(projectId),
      queryFn: () => getTicketAssigneesByProjectId(ticketRepository, projectId),
    });
  }, [filters, projectId, queryClient, search]);

  return {
    prefetchBoardView,
  };
};
