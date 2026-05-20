import type { QueryClient } from "@tanstack/react-query";

import { isArray, isNonEmptyString, isObject, isString } from "@/shared/utils";

import type { CommentWithAuthor } from "@/modules/board/core/domain/comment.types";
import type {
  Ticket,
  TicketAssignee,
} from "@/modules/board/core/domain/ticket.types";
import type { RealtimeRepository } from "@/modules/board/core/ports/realtimeRepository";
import type { CommentRow } from "@/modules/board/infrastructure/supabase/comment/types";
import type { TicketAssigneeRow } from "@/modules/board/infrastructure/supabase/ticket/types";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";
import { mapTicketListQueryKey } from "@/modules/board/presentation/hooks/queryKeys.mapper";

export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

type RealtimePayload = {
  eventType?: RealtimeEventType;
  new?: Record<string, unknown> | null;
  old?: Record<string, unknown> | null;
};

export type CommentRealtimeRow = Pick<
  CommentRow,
  "id" | "ticket_id" | "content" | "updated_at"
>;

export type TicketAssigneeRealtimeRow = Pick<
  TicketAssigneeRow,
  "ticket_id" | "user_id"
> & {
  assigned_at: string | null;
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

export const extractEntityId = (payload: unknown): string | null => {
  return extractStringField(payload, "id");
};

export const extractTicketId = (payload: unknown): string | null => {
  return extractStringField(payload, "ticket_id");
};

export const extractEventType = (
  payload: unknown
): RealtimeEventType | null => {
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

export const mapTicketFromPayload = (
  realtimeRepository: RealtimeRepository,
  payload: unknown,
  source: "new" | "old"
): Ticket | null => {
  return mapRowSafely(payload, source, realtimeRepository.mapTicketRowToDomain);
};

export const mapCommentRowFromPayload = (
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

export const mapTicketAssigneeRowFromPayload = (
  payload: unknown,
  source: "new" | "old"
): TicketAssigneeRealtimeRow | null => {
  const row = extractPayloadRow(payload, source);
  if (!row) {
    return null;
  }

  const ticketId = isString(row.ticket_id) ? row.ticket_id : null;
  const userId = isString(row.user_id) ? row.user_id : null;

  if (!ticketId || !userId) {
    return null;
  }

  return {
    ticket_id: ticketId,
    user_id: userId,
    assigned_at: isString(row.assigned_at) ? row.assigned_at : null,
  };
};

export const toDomainTicketAssignee = (
  row: TicketAssigneeRealtimeRow
): TicketAssignee | null => {
  if (!row.assigned_at) {
    return null;
  }

  return {
    userId: row.user_id,
    displayName: null,
    avatarUrl: null,
    assignedAt: new Date(row.assigned_at),
  };
};

const sortTicketAssignees = (assignees: TicketAssignee[]): TicketAssignee[] => {
  return [...assignees].sort((first, second) => {
    return first.assignedAt.getTime() - second.assignedAt.getTime();
  });
};

const upsertTicketAssignee = (
  assignees: TicketAssignee[],
  nextAssignee: TicketAssignee
): TicketAssignee[] => {
  const currentIndex = assignees.findIndex(
    (assignee) => assignee.userId === nextAssignee.userId
  );

  if (currentIndex === -1) {
    return sortTicketAssignees([...assignees, nextAssignee]);
  }

  const currentAssignee = assignees[currentIndex];
  const hasSamePayload =
    currentAssignee.displayName === nextAssignee.displayName &&
    currentAssignee.avatarUrl === nextAssignee.avatarUrl &&
    currentAssignee.assignedAt.getTime() === nextAssignee.assignedAt.getTime();

  if (hasSamePayload) {
    return assignees;
  }

  const nextAssignees = [...assignees];
  nextAssignees[currentIndex] = {
    ...currentAssignee,
    ...nextAssignee,
  };

  return sortTicketAssignees(nextAssignees);
};

const removeTicketAssignee = (
  assignees: TicketAssignee[],
  userId: string
): TicketAssignee[] => {
  const nextAssignees = assignees.filter(
    (assignee) => assignee.userId !== userId
  );
  return nextAssignees.length === assignees.length ? assignees : nextAssignees;
};

export const matchesTicketListFilter = (
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

export const invalidateProjectTickets = (
  queryClient: QueryClient,
  projectId: string
): void => {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.projects.ticketsRoot(projectId),
    refetchType: "active",
  });
};

export const insertTicketAcrossProjectLists = (
  queryClient: QueryClient,
  projectId: string,
  newTicket: Ticket
): void => {
  const projectTicketQueries = queryClient.getQueriesData<Ticket[]>({
    queryKey: queryKeys.projects.ticketsRoot(projectId),
  });

  for (const [queryKey, data] of projectTicketQueries) {
    if (!isArray(data)) {
      continue;
    }

    if (data.some((ticket) => ticket.id === newTicket.id)) {
      continue;
    }

    if (!matchesTicketListFilter(newTicket, queryKey)) {
      continue;
    }

    queryClient.setQueryData(queryKey, [newTicket, ...data]);
  }
};

export const patchTicketAcrossProjectLists = (
  queryClient: QueryClient,
  projectId: string,
  nextTicket: Ticket
): void => {
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

export const removeTicketFromProjectLists = (
  queryClient: QueryClient,
  projectId: string,
  ticketId: string
): void => {
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

export const patchCommentInTicketCache = (
  queryClient: QueryClient,
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

export const removeCommentFromTicketCache = (
  queryClient: QueryClient,
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

export const isTicketKnownInCurrentProject = (
  queryClient: QueryClient,
  projectId: string,
  ticketId: string
): boolean => {
  const ticketDetail = queryClient.getQueryData<Ticket>(
    queryKeys.tickets.detail(ticketId)
  );

  if (ticketDetail?.projectId === projectId) {
    return true;
  }

  const projectAssignees = queryClient.getQueryData<
    Record<string, TicketAssignee[]>
  >(queryKeys.tickets.assigneesByProjectId(projectId));

  if (
    isObject(projectAssignees) &&
    !Array.isArray(projectAssignees) &&
    Object.prototype.hasOwnProperty.call(projectAssignees, ticketId)
  ) {
    return true;
  }

  const projectTicketQueries = queryClient.getQueriesData<Ticket[]>({
    queryKey: queryKeys.projects.ticketsRoot(projectId),
  });

  return projectTicketQueries.some(([, data]) => {
    return Array.isArray(data) && data.some((ticket) => ticket.id === ticketId);
  });
};

export const patchTicketAssigneesCache = (
  queryClient: QueryClient,
  ticketId: string,
  update: (previous: TicketAssignee[]) => TicketAssignee[]
): boolean => {
  let didPatch = false;

  queryClient.setQueryData<TicketAssignee[]>(
    queryKeys.tickets.assignees(ticketId),
    (previous) => {
      if (!Array.isArray(previous)) {
        return previous;
      }

      const next = update(previous);
      if (next === previous) {
        return previous;
      }

      didPatch = true;
      return next;
    }
  );

  return didPatch;
};

export const patchProjectAssigneesCache = (
  queryClient: QueryClient,
  projectId: string,
  ticketId: string,
  update: (previous: TicketAssignee[]) => TicketAssignee[]
): boolean => {
  let didPatch = false;

  queryClient.setQueryData<Record<string, TicketAssignee[]>>(
    queryKeys.tickets.assigneesByProjectId(projectId),
    (previous) => {
      if (!isObject(previous) || Array.isArray(previous)) {
        return previous;
      }

      const previousTicketAssignees = Array.isArray(previous[ticketId])
        ? previous[ticketId]
        : [];
      const nextTicketAssignees = update(previousTicketAssignees);

      if (nextTicketAssignees === previousTicketAssignees) {
        return previous;
      }

      didPatch = true;

      if (nextTicketAssignees.length === 0) {
        if (!Object.prototype.hasOwnProperty.call(previous, ticketId)) {
          return previous;
        }

        const { [ticketId]: _removed, ...rest } = previous;
        return rest;
      }

      return {
        ...previous,
        [ticketId]: nextTicketAssignees,
      };
    }
  );

  return didPatch;
};

export const upsertAssigneeInTicketCaches = (
  previous: TicketAssignee[],
  nextAssignee: TicketAssignee
): TicketAssignee[] => {
  return upsertTicketAssignee(previous, nextAssignee);
};

export const removeAssigneeFromTicketCaches = (
  previous: TicketAssignee[],
  userId: string
): TicketAssignee[] => {
  return removeTicketAssignee(previous, userId);
};
