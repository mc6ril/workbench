"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  extractEntityId,
  extractEventType,
  extractTicketId,
  invalidateProjectTickets,
  isTicketKnownInCurrentProject,
  mapCommentRowFromPayload,
  mapTicketAssigneeRowFromPayload,
  mapTicketFromPayload,
  patchCommentInTicketCache,
  patchProjectAssigneesCache,
  patchTicketAcrossProjectLists,
  patchTicketAssigneesCache,
  removeAssigneeFromTicketCaches,
  removeCommentFromTicketCache,
  removeTicketFromProjectLists,
  toDomainTicketAssignee,
  upsertAssigneeInTicketCaches,
} from "./useProjectRealtime.helpers";

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

    // Important: comments/ticket_assignees have no project_id column.
    // Supabase Realtime filters are table-column based only, so we cannot scope these
    // subscriptions directly by project at SQL filter level.
    // We therefore subscribe globally and keep invalidations as targeted as possible.
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

    const channelWithComments = channelWithProjectMembers.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        // No project_id column on this table — subscription is project-unscoped.
        table: "comments",
      },
      (payload) => {
        const eventType = extractEventType(payload);
        const commentFromNew = mapCommentRowFromPayload(payload, "new");
        const commentFromOld = mapCommentRowFromPayload(payload, "old");
        const ticketId =
          extractTicketId(payload) ??
          commentFromNew?.ticket_id ??
          commentFromOld?.ticket_id ??
          null;

        if (!ticketId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.comments.root(),
            refetchType: "active",
          });
          return;
        }

        if (eventType === "UPDATE" && commentFromNew) {
          const didPatch = patchCommentInTicketCache(
            queryClient,
            ticketId,
            commentFromNew.id,
            {
              content: commentFromNew.content,
              updated_at: commentFromNew.updated_at,
            }
          );

          if (didPatch) {
            return;
          }
        }

        if (eventType === "DELETE" && commentFromOld) {
          const didRemove = removeCommentFromTicketCache(
            queryClient,
            ticketId,
            commentFromOld.id
          );
          if (didRemove) {
            return;
          }
        }

        void queryClient.invalidateQueries({
          queryKey: queryKeys.comments.byTicket(ticketId),
          refetchType: "active",
        });
      }
    );

    const channelWithTicketAssignees = channelWithComments.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        // No project_id column on this table — subscription is project-unscoped.
        table: "ticket_assignees",
      },
      (payload) => {
        const eventType = extractEventType(payload);
        const nextAssigneeRow = mapTicketAssigneeRowFromPayload(payload, "new");
        const previousAssigneeRow = mapTicketAssigneeRowFromPayload(
          payload,
          "old"
        );
        const ticketId =
          extractTicketId(payload) ??
          nextAssigneeRow?.ticket_id ??
          previousAssigneeRow?.ticket_id ??
          null;

        if (!ticketId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.assigneesByProjectId(projectId),
            refetchType: "active",
          });
          return;
        }

        if (!isTicketKnownInCurrentProject(queryClient, projectId, ticketId)) {
          return;
        }

        const hasTicketAssigneesCache =
          queryClient.getQueryState(queryKeys.tickets.assignees(ticketId)) !=
          null;
        const hasProjectAssigneesCache =
          queryClient.getQueryState(
            queryKeys.tickets.assigneesByProjectId(projectId)
          ) != null;

        let didPatchTicketAssignees = false;
        let didPatchProjectAssignees = false;

        if (
          (eventType === "INSERT" || eventType === "UPDATE") &&
          nextAssigneeRow
        ) {
          const nextAssignee = toDomainTicketAssignee(nextAssigneeRow);

          if (nextAssignee) {
            didPatchTicketAssignees = patchTicketAssigneesCache(
              queryClient,
              ticketId,
              (previous) =>
                upsertAssigneeInTicketCaches(previous, nextAssignee)
            );
            didPatchProjectAssignees = patchProjectAssigneesCache(
              queryClient,
              projectId,
              ticketId,
              (previous) =>
                upsertAssigneeInTicketCaches(previous, nextAssignee)
            );
          }
        }

        if (eventType === "DELETE" && previousAssigneeRow) {
          didPatchTicketAssignees = patchTicketAssigneesCache(
            queryClient,
            ticketId,
            (previous) =>
              removeAssigneeFromTicketCaches(
                previous,
                previousAssigneeRow.user_id
              )
          );
          didPatchProjectAssignees = patchProjectAssigneesCache(
            queryClient,
            projectId,
            ticketId,
            (previous) =>
              removeAssigneeFromTicketCaches(
                previous,
                previousAssigneeRow.user_id
              )
          );
        }

        if (hasTicketAssigneesCache && !didPatchTicketAssignees) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.assignees(ticketId),
            refetchType: "active",
          });
        }

        if (hasProjectAssigneesCache && !didPatchProjectAssignees) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.assigneesByProjectId(projectId),
            refetchType: "active",
          });
        }
      }
    );

    const channelSubscription = channelWithTicketAssignees.subscribe();

    return () => {
      void realtimeRepository.removeChannel(channelSubscription);
    };
  }, [boardId, options?.enabled, projectId, queryClient]);
};
