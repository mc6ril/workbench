"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { CommentWithAuthor } from "@/core/domain/schema/comment.schema";
import type {
  Epic,
  EpicDetail,
  EpicWithProgress,
} from "@/core/domain/schema/epic.schema";
import type { Label } from "@/core/domain/schema/label.schema";
import type { Sprint } from "@/core/domain/schema/sprint.schema";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { getRealtimeRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

import type { RealtimeRepository } from "@/core/ports/realtimeRepository";

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

const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object";
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
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as RealtimePayload;
  const newValue = candidate.new?.[fieldName];

  if (typeof newValue === "string" && newValue.length > 0) {
    return newValue;
  }

  const oldValue = candidate.old?.[fieldName];

  if (typeof oldValue === "string" && oldValue.length > 0) {
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

const mapEpicFromPayload = (
  realtimeRepository: RealtimeRepository,
  payload: unknown,
  source: "new" | "old"
): Epic | null => {
  return mapRowSafely(payload, source, realtimeRepository.mapEpicRowToDomain);
};

const mapLabelFromPayload = (
  realtimeRepository: RealtimeRepository,
  payload: unknown,
  source: "new" | "old"
): Label | null => {
  return mapRowSafely(payload, source, realtimeRepository.mapLabelRowToDomain);
};

const mapSprintFromPayload = (
  realtimeRepository: RealtimeRepository,
  payload: unknown,
  source: "new" | "old"
): Sprint | null => {
  return mapRowSafely(payload, source, realtimeRepository.mapSprintRowToDomain);
};

const mapCommentRowFromPayload = (
  payload: unknown,
  source: "new" | "old"
): CommentRealtimeRow | null => {
  const row = extractPayloadRow(payload, source);
  if (!row) {
    return null;
  }

  const id = typeof row.id === "string" ? row.id : null;
  const ticketId = typeof row.ticket_id === "string" ? row.ticket_id : null;

  if (!id || !ticketId) {
    return null;
  }

  return {
    id,
    ticket_id: ticketId,
    content: typeof row.content === "string" ? row.content : "",
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
  };
};

const isTicketListQueryKey = (
  queryKey: readonly unknown[],
  projectId: string
): boolean => {
  return (
    queryKey[0] === "projects" &&
    queryKey[1] === projectId &&
    queryKey[2] === "tickets" &&
    queryKey[3] === "list"
  );
};

const extractFilterKeyFromTicketListQuery = (
  queryKey: readonly unknown[]
): unknown[] | null => {
  if (!Array.isArray(queryKey[4])) {
    return null;
  }

  return queryKey[4] as unknown[];
};

const hasLabelFilterInTicketListQuery = (
  queryKey: readonly unknown[],
  projectId: string
): boolean => {
  if (!isTicketListQueryKey(queryKey, projectId)) {
    return false;
  }

  const filterKey = extractFilterKeyFromTicketListQuery(queryKey);
  if (!filterKey || !Array.isArray(filterKey[5])) {
    return false;
  }

  return filterKey[5].length > 0;
};

const matchesTicketListFilter = (
  ticket: Ticket,
  queryKey: readonly unknown[]
): boolean => {
  const filterKey = extractFilterKeyFromTicketListQuery(queryKey);
  if (!filterKey) {
    return true;
  }

  const [status, epicId, parentId, sprintId, priority, labelIds] = filterKey;

  if (typeof status === "string" && ticket.status !== status) {
    return false;
  }

  if (typeof epicId === "string" && ticket.epicId !== epicId) {
    return false;
  }

  // parentId / sprintId are tri-state in domain but query key flattens "undefined" and
  // explicit null to the same value. We only enforce strict checks for explicit strings.
  if (typeof parentId === "string" && ticket.parentId !== parentId) {
    return false;
  }

  if (typeof sprintId === "string" && ticket.sprintId !== sprintId) {
    return false;
  }

  if (typeof priority === "string" && ticket.priority !== priority) {
    return false;
  }

  // Label filtering depends on ticket_labels join table and cannot be inferred
  // from Ticket data alone, so we keep patched entries and rely on targeted
  // invalidation for label-filtered queries.
  void labelIds;
  return true;
};

const shouldInvalidateEpicsForTicketChange = (
  eventType: RealtimeEventType | null,
  nextTicket: Ticket | null,
  previousTicket: Ticket | null
): boolean => {
  if (eventType === "INSERT" || eventType === "DELETE") {
    return true;
  }

  if (eventType !== "UPDATE" || !nextTicket || !previousTicket) {
    return false;
  }

  return (
    nextTicket.status !== previousTicket.status ||
    nextTicket.epicId !== previousTicket.epicId
  );
};

const updateEntityInArray = <T extends { id: string }>(
  previous: T[] | undefined,
  entity: T
): T[] | undefined => {
  if (!Array.isArray(previous)) {
    return previous;
  }

  const index = previous.findIndex((item) => item.id === entity.id);
  if (index < 0) {
    return previous;
  }

  const next = [...previous];
  next[index] = entity;
  return next;
};

const removeEntityFromArray = <T extends { id: string }>(
  previous: T[] | undefined,
  entityId: string
): T[] | undefined => {
  if (!Array.isArray(previous)) {
    return previous;
  }

  const next = previous.filter((item) => item.id !== entityId);
  if (next.length === previous.length) {
    return previous;
  }

  return next;
};

/**
 * Subscribe to project realtime changes and keep project views fresh.
 * Mounted once at project shell level so board/epics stay synchronized.
 */
export const useProjectRealtime = (projectId: string, boardId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const realtimeRepository = getRealtimeRepository();
    let pendingEpicsInvalidationTimeout: ReturnType<typeof setTimeout> | null =
      null;

    const invalidateProjectTickets = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
        refetchType: "active",
      });
    };

    const invalidateEpicsRoot = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.epicsRoot(projectId),
        refetchType: "active",
      });
    };

    const scheduleEpicsRootInvalidation = () => {
      if (pendingEpicsInvalidationTimeout) {
        return;
      }

      pendingEpicsInvalidationTimeout = setTimeout(() => {
        pendingEpicsInvalidationTimeout = null;
        invalidateEpicsRoot();
      }, 120);
    };

    const invalidateTicketListsWithLabelFilters = () => {
      void queryClient.invalidateQueries({
        predicate: (query) =>
          hasLabelFilterInTicketListQuery(query.queryKey, projectId),
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

    const patchEpicInCaches = (epic: Epic) => {
      queryClient.setQueryData<EpicWithProgress[]>(
        queryKeys.projects.epicsList(projectId),
        (previous) => {
          if (!Array.isArray(previous)) {
            return previous;
          }

          const next = previous.map((currentEpic) => {
            if (currentEpic.id !== epic.id) {
              return currentEpic;
            }

            return {
              ...currentEpic,
              ...epic,
            };
          });

          return next;
        }
      );

      queryClient.setQueryData<EpicDetail>(
        queryKeys.epics.detail(epic.id),
        (previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            ...epic,
          };
        }
      );
    };

    const removeEpicFromCaches = (epicId: string) => {
      queryClient.setQueryData<EpicWithProgress[]>(
        queryKeys.projects.epicsList(projectId),
        (previous) => removeEntityFromArray(previous, epicId)
      );

      queryClient.removeQueries({
        queryKey: queryKeys.epics.detail(epicId),
        exact: true,
      });
    };

    const patchLabelInCache = (label: Label) => {
      queryClient.setQueryData<Label[]>(
        queryKeys.labels.byProject(projectId),
        (previous) => updateEntityInArray(previous, label)
      );
    };

    const removeLabelFromCache = (labelId: string) => {
      queryClient.setQueryData<Label[]>(
        queryKeys.labels.byProject(projectId),
        (previous) => removeEntityFromArray(previous, labelId)
      );
    };

    const patchSprintInCache = (sprint: Sprint) => {
      queryClient.setQueryData<Sprint[]>(
        queryKeys.sprints.byProject(projectId),
        (previous) => updateEntityInArray(previous, sprint)
      );
    };

    const removeSprintFromCache = (sprintId: string) => {
      queryClient.setQueryData<Sprint[]>(
        queryKeys.sprints.byProject(projectId),
        (previous) => removeEntityFromArray(previous, sprintId)
      );
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
        const previousTicket = mapTicketFromPayload(
          realtimeRepository,
          payload,
          "old"
        );

        if (eventType === "UPDATE" && ticketId && nextTicket) {
          queryClient.setQueryData(
            queryKeys.tickets.detail(ticketId),
            nextTicket
          );
          patchTicketAcrossProjectLists(nextTicket);

          if (
            shouldInvalidateEpicsForTicketChange(
              eventType,
              nextTicket,
              previousTicket
            )
          ) {
            scheduleEpicsRootInvalidation();
          }

          return;
        }

        if (eventType === "DELETE" && ticketId) {
          removeTicketFromProjectLists(ticketId);
          queryClient.removeQueries({
            queryKey: queryKeys.tickets.detail(ticketId),
            exact: true,
          });
          invalidateProjectTickets();
          scheduleEpicsRootInvalidation();
          return;
        }

        invalidateProjectTickets();

        if ((eventType === "UPDATE" || eventType === "DELETE") && ticketId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.detail(ticketId),
            refetchType: "active",
          });
        }

        if (
          shouldInvalidateEpicsForTicketChange(
            eventType,
            nextTicket,
            previousTicket
          )
        ) {
          scheduleEpicsRootInvalidation();
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

    // Important: comments/ticket_assignees/ticket_labels have no project_id column.
    // Supabase Realtime filters are table-column based only, so we cannot scope these
    // subscriptions directly by project at SQL filter level.
    // We therefore subscribe globally and keep invalidations as targeted as possible.
    const channelWithEpics = channelWithColumns.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "epics",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        const eventType = extractEventType(payload);
        const epicId = extractEntityId(payload);
        const nextEpic = mapEpicFromPayload(realtimeRepository, payload, "new");

        if (eventType === "UPDATE" && epicId && nextEpic) {
          patchEpicInCaches(nextEpic);
          return;
        }

        if (eventType === "DELETE" && epicId) {
          removeEpicFromCaches(epicId);
          invalidateEpicsRoot();
          return;
        }

        invalidateEpicsRoot();

        if (epicId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.epics.detail(epicId),
            refetchType: "active",
          });
        }
      }
    );

    const channelWithSprints = channelWithEpics.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sprints",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        const eventType = extractEventType(payload);
        const sprintId = extractEntityId(payload);
        const nextSprint = mapSprintFromPayload(
          realtimeRepository,
          payload,
          "new"
        );

        if (eventType === "UPDATE" && sprintId && nextSprint) {
          patchSprintInCache(nextSprint);
          return;
        }

        if (eventType === "DELETE" && sprintId) {
          removeSprintFromCache(sprintId);
          return;
        }

        void queryClient.invalidateQueries({
          queryKey: queryKeys.sprints.byProject(projectId),
          refetchType: "active",
        });
      }
    );

    const channelWithLabels = channelWithSprints.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "labels",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        const eventType = extractEventType(payload);
        const labelId = extractEntityId(payload);
        const nextLabel = mapLabelFromPayload(
          realtimeRepository,
          payload,
          "new"
        );

        if (eventType === "UPDATE" && labelId && nextLabel) {
          patchLabelInCache(nextLabel);
          return;
        }

        if (eventType === "DELETE" && labelId) {
          removeLabelFromCache(labelId);
          return;
        }

        void queryClient.invalidateQueries({
          queryKey: queryKeys.labels.byProject(projectId),
          refetchType: "active",
        });
      }
    );

    const channelWithProjectMembers = channelWithLabels.on(
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

    const channelWithTicketLabels = channelWithTicketAssignees.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        // No project_id column on this table — subscription is project-unscoped.
        table: "ticket_labels",
      },
      (payload) => {
        const ticketId = extractTicketId(payload);

        if (ticketId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.labels.byTicket(ticketId),
            refetchType: "active",
          });
        } else {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.labels.byProject(projectId),
            refetchType: "active",
          });
        }

        invalidateTicketListsWithLabelFilters();
      }
    );

    const channelSubscription = channelWithTicketLabels.subscribe();

    return () => {
      if (pendingEpicsInvalidationTimeout) {
        clearTimeout(pendingEpicsInvalidationTimeout);
      }
      void realtimeRepository.removeChannel(channelSubscription);
    };
  }, [boardId, projectId, queryClient]);
};
