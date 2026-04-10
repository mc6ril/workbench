"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { listComments } from "@/modules/board/core/usecases/comment/listComments";
import { getTicketDetail } from "@/modules/board/core/usecases/ticket/getTicketDetail";
import {
  commentRepository,
  ticketRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Warm the ticket detail cache for the specific ticket the user is about to
 * open, without changing the board's own assignee/avatar data flow.
 */
export const usePrefetchTicketDetail = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (ticketId: string) => {
      if (!ticketId) {
        return;
      }

      void Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: queryKeys.tickets.detail(ticketId),
          queryFn: () => getTicketDetail(ticketRepository, ticketId),
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.tickets.assignees(ticketId),
          queryFn: () => ticketRepository.getAssignees(ticketId),
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.comments.byTicket(ticketId),
          queryFn: () => listComments(ticketId, commentRepository),
        }),
      ]);
    },
    [queryClient]
  );
};
