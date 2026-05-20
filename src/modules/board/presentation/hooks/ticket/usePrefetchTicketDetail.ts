"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { buildTicketDetailRoute } from "@/shared/utils/routes";

import { listComments } from "@/modules/board/core/usecases/comment/listComments";
import { getTicketDetail } from "@/modules/board/core/usecases/ticket/getTicketDetail";
import {
  commentRepository,
  ticketRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

export const usePrefetchTicketDetail = (projectId: string) => {
  const queryClient = useQueryClient();
  const router = useAppRouter();

  return useCallback(
    (ticketId: string) => {
      if (!ticketId) {
        return;
      }

      router.prefetch(buildTicketDetailRoute(projectId, ticketId));

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
    [projectId, queryClient, router]
  );
};
