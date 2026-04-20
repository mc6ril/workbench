import { isNumber, isObject, isString } from "@/shared/utils";

import type { TicketFilters } from "@/modules/board/core/domain/ticket.types";
import { TICKET_PRIORITY_VALUES } from "@/modules/board/core/domain/ticket.types";

export type TicketListFilterKey = readonly [
  columnId: TicketFilters["columnId"] | null,
  priority: TicketFilters["priority"] | null,
  assigneeUserId: TicketFilters["assigneeUserId"] | null,
  unassignedOnly: true | null,
];

export type TicketListQueryParamsKey = Readonly<{
  filters: TicketListFilterKey | null;
  search: string | null;
  limit: number | null;
}>;

export type TicketListQueryKeyDescriptor = {
  projectId: string;
  filters: {
    columnId: TicketFilters["columnId"] | null;
    priority: TicketFilters["priority"] | null;
    assigneeUserId: TicketFilters["assigneeUserId"] | null;
    unassignedOnly: boolean;
  } | null;
  search: string | null;
  limit: number | null;
};

export const createTicketListFilterKey = (
  filters?: TicketFilters
): TicketListFilterKey | null => {
  if (!filters) {
    return null;
  }

  const hasMeaningfulFilters = Boolean(
    filters.columnId ??
    filters.priority ??
    filters.assigneeUserId ??
    filters.unassignedOnly
  );
  if (!hasMeaningfulFilters) {
    return null;
  }

  return [
    filters.columnId ?? null,
    filters.priority ?? null,
    filters.assigneeUserId ?? null,
    filters.unassignedOnly === true ? true : null,
  ] as const;
};

export const createTicketListQueryParamsKey = (
  filters?: TicketFilters,
  search?: string,
  limit?: number
): TicketListQueryParamsKey => {
  return {
    filters: createTicketListFilterKey(filters),
    search: search?.trim() || null,
    limit: limit ?? null,
  };
};

const isTicketPriority = (
  value: unknown
): value is NonNullable<TicketFilters["priority"]> => {
  return (
    isString(value) &&
    (TICKET_PRIORITY_VALUES as readonly string[]).includes(value)
  );
};

const mapTicketListFilterKey = (
  filterKey: unknown
): TicketListQueryKeyDescriptor["filters"] => {
  if (!Array.isArray(filterKey)) {
    return null;
  }

  const [columnId, priority, assigneeUserId, unassignedOnly] = filterKey;

  return {
    columnId: isString(columnId) ? columnId : null,
    priority: isTicketPriority(priority) ? priority : null,
    assigneeUserId: isString(assigneeUserId) ? assigneeUserId : null,
    unassignedOnly: unassignedOnly === true,
  };
};

const mapTicketListQueryParamsKey = (
  paramsKey: unknown
): Omit<TicketListQueryKeyDescriptor, "projectId"> => {
  if (!isObject(paramsKey)) {
    return {
      filters: null,
      search: null,
      limit: null,
    };
  }

  return {
    filters: mapTicketListFilterKey(paramsKey.filters),
    search: isString(paramsKey.search) ? paramsKey.search : null,
    limit: isNumber(paramsKey.limit) ? paramsKey.limit : null,
  };
};

export const mapTicketListQueryKey = (
  queryKey: readonly unknown[]
): TicketListQueryKeyDescriptor | null => {
  const [scope, projectId, resource, operation, paramsKey] = queryKey;

  if (
    scope !== "projects" ||
    !isString(projectId) ||
    resource !== "tickets" ||
    operation !== "list" ||
    !isObject(paramsKey)
  ) {
    return null;
  }

  return {
    projectId,
    ...mapTicketListQueryParamsKey(paramsKey),
  };
};
