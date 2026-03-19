import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type {
  TicketFilters,
  TicketSort,
} from "@/modules/board/core/domain/schema/ticket.schema";
import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";
import { listEpics } from "@/modules/board/core/usecases/epic/listEpics";
import { getTicketAssigneesByProjectId } from "@/modules/board/core/usecases/ticket/getTicketAssigneesByProjectId";
import { listTickets } from "@/modules/board/core/usecases/ticket/listTickets";
import {
  boardRepository,
  epicRepository,
  ticketRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

type UsePrefetchProjectViewsParams = {
  projectId: string;
  filters?: TicketFilters;
  sort?: TicketSort;
  search?: string;
};

export const usePrefetchProjectViews = ({
  projectId,
  filters,
  sort,
  search,
}: UsePrefetchProjectViewsParams) => {
  const queryClient = useQueryClient();

  const prefetchBoardView = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.boardConfiguration(projectId),
      queryFn: () => getBoardConfiguration(boardRepository, projectId),
    });

    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.ticketsList(projectId, filters, sort, search),
      queryFn: () =>
        listTickets(ticketRepository, projectId, filters, sort, search),
    });

    void queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.assigneesByProjectId(projectId),
      queryFn: () => getTicketAssigneesByProjectId(ticketRepository, projectId),
    });
  }, [filters, projectId, queryClient, search, sort]);

  const prefetchEpicsView = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects.epicsList(projectId),
      queryFn: () => listEpics(epicRepository, boardRepository, projectId),
    });
  }, [projectId, queryClient]);

  return {
    prefetchBoardView,
    prefetchEpicsView,
  };
};
