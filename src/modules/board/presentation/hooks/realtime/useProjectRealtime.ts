"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { isNonEmptyString, isObject, isString } from "@/shared/utils";

import type { CommentWithAuthor } from "@/modules/board/core/domain/schema/comment.schema";
import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import type { RealtimeRepository } from "@/modules/board/core/ports/realtimeRepository";
import { getRealtimeRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";
import { mapTicketListQueryKey } from "@/modules/board/presentation/hooks/queryKeys.mapper";

type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

type RealtimePayload = {
  eventType?: RealtimeEventType;
  new?: Record<string, unknown> | null;
  old?: Record<string, unknown> | null;
};

type CommentRealtimeRow = {
  id: string;
  ticket_id: string;
  content: string;
  updated_at: string;
};

const extractPayloadRow = (
  payload: unknown,
  source: "new" | "old"
): Record<string, unknown> | null => {
  if (!isObject(payload)) {
    return null;
  }

  const candidate = payload as RealtimePayload;
  const row = candidate[source];
  return isObject(row) ? row : null;
};

const extractStringField = (
  payload: unknown,
  fieldName: string
): string | null => {
  if (!payload || !isObject(payload)) {
    return null;
  }

  const candidate = payload as RealtimePayload;
  const newValue = candidate.new?.[fieldName];

  if (isString(newValue) && isNonEmptyString(newValue)) {
    return newValue;
  }

  const oldValue = candidate.old?.[fieldName];

  if (isString(oldValue) && isNonEmptyString(oldValue)) {
    return oldValue;
  }

  return null;
};

const extractEntityId = (payload: unknown): string | null => {
  return extractStringField(payload, "id");
};

const extractTicketId = (payload: unknown): string | null => {
  return extractStringField(payload, "ticket_id");
};

const extractEventType = (payload: unknown): RealtimeEventType | null => {
  if (!isObject(payload)) {
    return null;
  }

  const eventType = (payload as RealtimePayload).eventType;
  if (
    eventType === "INSERT" ||
    eventType === "UPDATE" ||
    eventType === "DELETE"
  ) {
    return eventType;
  }

  return null;
};

const mapRowSafely = <TRow, TDomain>(
  payload: unknown,
  source: "new" | "old",
  mapper: (row: TRow) => TDomain
): TDomain | null => {
  const row = extractPayloadRow(payload, source);
  if (!row) {
    return null;
  }

  try {
    return mapper(row as TRow);
  } catch {
    return null;
  }
};

const mapTicketFromPayload = (
  realtimeRepository: RealtimeRepository,
  payload: unknown,
  source: "new" | "old"
): Ticket | null => {
  return mapRowSafely(payload, source, realtimeRepository.mapTicketRowToDomain);
};

const mapCommentRowFromPayload = (
  payload: unknown,
  source: "new" | "old"
): CommentRealtimeRow | null => {
  const row = extractPayloadRow(payload, source);
  if (!row) {
    return null;
  }

  const id = isString(row.id) ? row.id : null;
  const ticketId = isString(row.ticket_id) ? row.ticket_id : null;

  if (!id || !ticketId) {
    return null;
  }

  return {
    id,
    ticket_id: ticketId,
    content: isString(row.content) ? row.content : "",
    updated_at: isString(row.updated_at) ? row.updated_at : "",
  };
};

const matchesTicketListFilter = (
  ticket: Ticket,
  queryKey: readonly unknown[]
): boolean => {
  if (ticket.archivedAt !== null) {
    return false;
  }

  const mappedQueryKey = mapTicketListQueryKey(queryKey);
  if (!mappedQueryKey) {
    return true;
  }

  const { filters } = mappedQueryKey;
  if (!filters) {
    return true;
  }

  const { columnId, priority } = filters;

  if (isString(columnId) && ticket.columnId !== columnId) {
    return false;
  }

  if (isString(priority) && ticket.priority !== priority) {
    return false;
  }
  return true;
};

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

    const invalidateProjectTickets = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
        refetchType: "active",
      });
    };

    const patchTicketAcrossProjectLists = (nextTicket: Ticket) => {
      const projectTicketQueries = queryClient.getQueriesData<Ticket[]>({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
      });

      for (const [queryKey, data] of projectTicketQueries) {
        if (!Array.isArray(data)) {
          continue;
        }

        const currentIndex = data.findIndex(
          (ticket) => ticket.id === nextTicket.id
        );
        if (currentIndex < 0) {
          continue;
        }

        let nextData = [...data];
        const previousTicket = nextData[currentIndex];
        const mergedTicket = {
          ...previousTicket,
          ...nextTicket,
        };

        if (matchesTicketListFilter(mergedTicket, queryKey)) {
          nextData[currentIndex] = mergedTicket;
        } else {
          nextData = nextData.filter((ticket) => ticket.id !== nextTicket.id);
        }

        queryClient.setQueryData(queryKey, nextData);
      }
    };

    const removeTicketFromProjectLists = (ticketId: string) => {
      const projectTicketQueries = queryClient.getQueriesData<Ticket[]>({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
      });

      for (const [queryKey, data] of projectTicketQueries) {
        if (!Array.isArray(data)) {
          continue;
        }

        const next = data.filter((ticket) => ticket.id !== ticketId);
        if (next.length === data.length) {
          continue;
        }

        queryClient.setQueryData(queryKey, next);
      }
    };

    const patchCommentInTicketCache = (
      ticketId: string,
      commentId: string,
      patch: Pick<CommentRealtimeRow, "content" | "updated_at">
    ): boolean => {
      let didPatch = false;

      queryClient.setQueryData<CommentWithAuthor[]>(
        queryKeys.comments.byTicket(ticketId),
        (previous) => {
          if (!Array.isArray(previous)) {
            return previous;
          }

          const next = previous.map((comment) => {
            if (comment.id !== commentId) {
              return comment;
            }

            didPatch = true;
            return {
              ...comment,
              content: patch.content || comment.content,
              updatedAt: patch.updated_at
                ? new Date(patch.updated_at)
                : comment.updatedAt,
            };
          });

          return next;
        }
      );

      return didPatch;
    };

    const removeCommentFromTicketCache = (
      ticketId: string,
      commentId: string
    ): boolean => {
      let didRemove = false;

      queryClient.setQueryData<CommentWithAuthor[]>(
        queryKeys.comments.byTicket(ticketId),
        (previous) => {
          if (!Array.isArray(previous)) {
            return previous;
          }

          const next = previous.filter((comment) => comment.id !== commentId);
          didRemove = next.length !== previous.length;
          return didRemove ? next : previous;
        }
      );

      return didRemove;
    };

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
          patchTicketAcrossProjectLists(nextTicket);
          return;
        }

        if (eventType === "DELETE" && ticketId) {
          removeTicketFromProjectLists(ticketId);
          queryClient.removeQueries({
            queryKey: queryKeys.tickets.detail(ticketId),
            exact: true,
          });
          invalidateProjectTickets();
          return;
        }

        invalidateProjectTickets();

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
        const ticketId = extractTicketId(payload);

        if (ticketId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.assignees(ticketId),
            refetchType: "active",
          });
        }

        void queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.assigneesByProjectId(projectId),
          refetchType: "active",
        });
      }
    );

    const channelSubscription = channelWithTicketAssignees.subscribe();

    return () => {
      void realtimeRepository.removeChannel(channelSubscription);
    };
  }, [boardId, options?.enabled, projectId, queryClient]);
};
