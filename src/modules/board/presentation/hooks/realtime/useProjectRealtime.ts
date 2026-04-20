"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  extractEntityId,
  extractEventType,
  invalidateProjectTickets,
  mapTicketFromPayload,
  patchTicketAcrossProjectLists,
  removeTicketFromProjectLists,
} from "./useProjectRealtime.helpers";
import {
  registerCommentSubscriptions,
  registerTicketAssigneeSubscriptions,
} from "./useProjectRealtime.subscriptions";

import { getRealtimeRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Subscribe to project realtime changes and keep board-related project views fresh.
 * Mounted once at project shell level so the board stays synchronized.
 */
export const useProjectRealtime = (
  projectId: string,
  boardId?: string,
  options?: { enabled?: boolean }
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId || options?.enabled === false) {
      return;
    }

    const realtimeRepository = getRealtimeRepository();
    const channelName = `project:${projectId}:realtime`;

    const channelWithTickets = realtimeRepository.createChannel(channelName).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tickets",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        const eventType = extractEventType(payload);
        const ticketId = extractEntityId(payload);
        const nextTicket = mapTicketFromPayload(
          realtimeRepository,
          payload,
          "new"
        );

        if (eventType === "UPDATE" && ticketId && nextTicket) {
          queryClient.setQueryData(
            queryKeys.tickets.detail(ticketId),
            nextTicket
          );
          patchTicketAcrossProjectLists(queryClient, projectId, nextTicket);
          return;
        }

        if (eventType === "DELETE" && ticketId) {
          removeTicketFromProjectLists(queryClient, projectId, ticketId);
          queryClient.removeQueries({
            queryKey: queryKeys.tickets.detail(ticketId),
            exact: true,
          });
          invalidateProjectTickets(queryClient, projectId);
          return;
        }

        invalidateProjectTickets(queryClient, projectId);

        if ((eventType === "UPDATE" || eventType === "DELETE") && ticketId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.detail(ticketId),
            refetchType: "active",
          });
        }
      }
    );

    const channelWithColumns = boardId
      ? channelWithTickets.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "columns",
            filter: `board_id=eq.${boardId}`,
          },
          () => {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.projects.boardConfiguration(projectId),
              refetchType: "active",
            });
          }
        )
      : channelWithTickets;
    // Note: boardId may be undefined on the first render while board config loads.
    // We intentionally keep tickets subscriptions active immediately and attach
    // columns subscription as soon as boardId is resolved.

    // comments/ticket_assignees can use project_id filters for INSERT/UPDATE, but
    // Supabase Realtime does not support filtered DELETE subscriptions.
    const channelWithProjectMembers = channelWithColumns.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "project_members",
        filter: `project_id=eq.${projectId}`,
      },
      () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.members.byProject(projectId),
          refetchType: "active",
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.currentRole(projectId),
          refetchType: "active",
        });
      }
    );

    const channelWithComments = registerCommentSubscriptions({
      channel: channelWithProjectMembers,
      projectId,
      queryClient,
    });

    const channelWithTicketAssignees = registerTicketAssigneeSubscriptions({
      channel: channelWithComments,
      projectId,
      queryClient,
    });

    const channelSubscription = channelWithTicketAssignees.subscribe();

    return () => {
      void realtimeRepository.removeChannel(channelSubscription);
    };
  }, [boardId, options?.enabled, projectId, queryClient]);
};
