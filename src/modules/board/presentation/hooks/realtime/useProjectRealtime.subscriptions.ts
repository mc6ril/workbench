import type { QueryClient } from "@tanstack/react-query";

import {
  extractEventType,
  extractTicketId,
  mapCommentRowFromPayload,
  mapTicketAssigneeRowFromPayload,
  patchCommentInTicketCache,
  patchProjectAssigneesCache,
  patchTicketAssigneesCache,
  removeAssigneeFromTicketCaches,
  removeCommentFromTicketCache,
  toDomainTicketAssignee,
  upsertAssigneeInTicketCaches,
} from "./useProjectRealtime.helpers";

import type { RealtimeChannel } from "@/modules/board/core/ports/realtimeRepository";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

type ProjectRealtimeSubscriptionParams = {
  channel: RealtimeChannel;
  projectId: string;
  queryClient: QueryClient;
};

/**
 * Register comment subscriptions while keeping the cache mutation logic close to
 * the realtime wiring. DELETE stays unfiltered because Supabase does not support
 * filtered DELETE subscriptions for Postgres Changes.
 */
export const registerCommentSubscriptions = ({
  channel,
  projectId,
  queryClient,
}: ProjectRealtimeSubscriptionParams): RealtimeChannel => {
  const handleCommentChange = (payload: unknown) => {
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

    if (eventType === "INSERT" || eventType === "DELETE") {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byProject(projectId),
        refetchType: "active",
      });
    }

    void queryClient.invalidateQueries({
      queryKey: queryKeys.comments.byTicket(ticketId),
      refetchType: "active",
    });
  };

  return channel
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `project_id=eq.${projectId}`,
      },
      handleCommentChange
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "comments",
        filter: `project_id=eq.${projectId}`,
      },
      handleCommentChange
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "comments",
      },
      handleCommentChange
    );
};

/**
 * Register ticket assignee subscriptions. Like comments, DELETE stays
 * unfiltered so the hook can still recover when Supabase only sends primary
 * keys for RLS-protected deletes.
 */
export const registerTicketAssigneeSubscriptions = ({
  channel,
  projectId,
  queryClient,
}: ProjectRealtimeSubscriptionParams): RealtimeChannel => {
  const handleTicketAssigneeChange = (payload: unknown) => {
    const eventType = extractEventType(payload);
    const nextAssigneeRow = mapTicketAssigneeRowFromPayload(payload, "new");
    const previousAssigneeRow = mapTicketAssigneeRowFromPayload(payload, "old");
    const ticketId =
      extractTicketId(payload) ??
      nextAssigneeRow?.ticket_id ??
      previousAssigneeRow?.ticket_id ??
      null;

    if (!ticketId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.assigneesRoot(),
        refetchType: "active",
      });
      return;
    }

    const hasTicketAssigneesCache =
      queryClient.getQueryState(queryKeys.tickets.assignees(ticketId)) != null;
    const hasProjectAssigneesCache =
      queryClient.getQueryState(
        queryKeys.tickets.assigneesByProjectId(projectId)
      ) != null;

    let didPatchTicketAssignees = false;
    let didPatchProjectAssignees = false;

    if ((eventType === "INSERT" || eventType === "UPDATE") && nextAssigneeRow) {
      const nextAssignee = toDomainTicketAssignee(nextAssigneeRow);

      if (nextAssignee) {
        didPatchTicketAssignees = patchTicketAssigneesCache(
          queryClient,
          ticketId,
          (previous) => upsertAssigneeInTicketCaches(previous, nextAssignee)
        );
        didPatchProjectAssignees = patchProjectAssigneesCache(
          queryClient,
          projectId,
          ticketId,
          (previous) => upsertAssigneeInTicketCaches(previous, nextAssignee)
        );
      }
    }

    if (eventType === "DELETE" && previousAssigneeRow) {
      didPatchTicketAssignees = patchTicketAssigneesCache(
        queryClient,
        ticketId,
        (previous) =>
          removeAssigneeFromTicketCaches(previous, previousAssigneeRow.user_id)
      );
      didPatchProjectAssignees = patchProjectAssigneesCache(
        queryClient,
        projectId,
        ticketId,
        (previous) =>
          removeAssigneeFromTicketCaches(previous, previousAssigneeRow.user_id)
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
  };

  return channel
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ticket_assignees",
        filter: `project_id=eq.${projectId}`,
      },
      handleTicketAssigneeChange
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "ticket_assignees",
        filter: `project_id=eq.${projectId}`,
      },
      handleTicketAssigneeChange
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "ticket_assignees",
      },
      handleTicketAssigneeChange
    );
};
