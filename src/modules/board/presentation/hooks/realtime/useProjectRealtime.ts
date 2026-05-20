"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  extractEntityId,
  extractEventType,
  insertTicketAcrossProjectLists,
  invalidateProjectTickets,
  mapTicketFromPayload,
  patchTicketAcrossProjectLists,
  removeTicketFromProjectLists,
} from "./useProjectRealtime.helpers";
import {
  registerAttachmentSubscriptions,
  registerCommentSubscriptions,
  registerInvitationSubscriptions,
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

  // Core subscriptions: tickets and all project-level entities.
  // Stable — never torn down due to boardId changes.
  useEffect(() => {
    if (!projectId || options?.enabled === false) {
      return;
    }

    const realtimeRepository = getRealtimeRepository();

    const channelWithTickets = realtimeRepository
      .createChannel(`project:${projectId}:core`)
      .on(
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

          if (eventType === "INSERT" && nextTicket) {
            insertTicketAcrossProjectLists(queryClient, projectId, nextTicket);
            return;
          }

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

    const channelWithProjectMembers = channelWithTickets.on(
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

    const channelWithAttachments = registerAttachmentSubscriptions({
      channel: channelWithTicketAssignees,
      projectId,
      queryClient,
    });

    const channelWithInvitations = registerInvitationSubscriptions({
      channel: channelWithAttachments,
      projectId,
      queryClient,
    });

    const channelSubscription = channelWithInvitations.subscribe();

    return () => {
      void realtimeRepository.removeChannel(channelSubscription);
    };
  }, [options?.enabled, projectId, queryClient]);

  // Board-specific subscription: columns only.
  // Separate effect so boardId changes never interrupt ticket subscriptions.
  useEffect(() => {
    if (!projectId || !boardId || options?.enabled === false) {
      return;
    }

    const realtimeRepository = getRealtimeRepository();

    const channelSubscription = realtimeRepository
      .createChannel(`project:${projectId}:board`)
      .on(
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
      .subscribe();

    return () => {
      void realtimeRepository.removeChannel(channelSubscription);
    };
  }, [boardId, options?.enabled, projectId, queryClient]);
};
