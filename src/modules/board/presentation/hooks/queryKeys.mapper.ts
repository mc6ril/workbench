import { isNumber, isObject, isString } from "@/shared/utils";

import type {
  TicketFilters,
  TicketSort,
} from "@/modules/board/core/domain/schema/ticket.schema";
import { TICKET_PRIORITY_VALUES } from "@/modules/board/core/domain/schema/ticket.schema";

export type TicketListFilterKey = readonly [
  columnId: TicketFilters["columnId"] | null,
  priority: TicketFilters["priority"] | null,
];

export type TicketListSortKey = readonly [
  field: TicketSort["field"],
  direction: TicketSort["direction"],
];

export type TicketListQueryParamsKey = Readonly<{
  filters: TicketListFilterKey | null;
  sort: TicketListSortKey | null;
  search: string | null;
  limit: number | null;
}>;

export type TicketListQueryKeyDescriptor = {
  projectId: string;
  filters: {
    columnId: TicketFilters["columnId"] | null;
    priority: TicketFilters["priority"] | null;
  } | null;
  sort: TicketSort | null;
  search: string | null;
  limit: number | null;
};

export const createTicketListFilterKey = (
  filters?: TicketFilters
): TicketListFilterKey | null => {
  if (!filters) {
    return null;
  }

  return [filters.columnId ?? null, filters.priority ?? null] as const;
};

export const createTicketListSortKey = (
  sort?: TicketSort
): TicketListSortKey | null => {
  return sort ? ([sort.field, sort.direction] as const) : null;
};

export const createTicketListQueryParamsKey = (
  filters?: TicketFilters,
  sort?: TicketSort,
  search?: string,
  limit?: number
): TicketListQueryParamsKey => {
  return {
    filters: createTicketListFilterKey(filters),
    sort: createTicketListSortKey(sort),
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

  const [columnId, priority] = filterKey;

  return {
    columnId: isString(columnId) ? columnId : null,
    priority: isTicketPriority(priority) ? priority : null,
  };
};

const mapTicketListSortKey = (
  sortKey: unknown
): TicketListQueryKeyDescriptor["sort"] => {
  if (!Array.isArray(sortKey) || sortKey.length !== 2) {
    return null;
  }

  const [field, direction] = sortKey;

  if (!isString(field) || !isString(direction)) {
    return null;
  }

  return {
    field: field as TicketSort["field"],
    direction: direction as TicketSort["direction"],
  };
};

const mapTicketListQueryParamsKey = (
  paramsKey: unknown
): Omit<TicketListQueryKeyDescriptor, "projectId"> => {
  if (!isObject(paramsKey)) {
    return {
      filters: null,
      sort: null,
      search: null,
      limit: null,
    };
  }

  return {
    filters: mapTicketListFilterKey(paramsKey.filters),
    sort: mapTicketListSortKey(paramsKey.sort),
    search: isString(paramsKey.search) ? paramsKey.search : null,
    limit: isNumber(paramsKey.limit) ? paramsKey.limit : null,
  };
};

const mapLegacyTicketListQueryParamsKey = (
  filterKey: unknown,
  sortKey: unknown,
  search: unknown,
  limit: unknown
): Omit<TicketListQueryKeyDescriptor, "projectId"> => {
  return {
    filters: mapTicketListFilterKey(filterKey),
    sort: mapTicketListSortKey(sortKey),
    search: isString(search) ? search : null,
    limit: isNumber(limit) ? limit : null,
  };
};

export const mapTicketListQueryKey = (
  queryKey: readonly unknown[]
): TicketListQueryKeyDescriptor | null => {
  const [
    scope,
    projectId,
    resource,
    operation,
    paramsKey,
    legacySortKey,
    legacySearch,
    legacyLimit,
  ] = queryKey;

  if (
    scope !== "projects" ||
    !isString(projectId) ||
    resource !== "tickets" ||
    operation !== "list"
  ) {
    return null;
  }

  if (isObject(paramsKey)) {
    return {
      projectId,
      ...mapTicketListQueryParamsKey(paramsKey),
    };
  }

  return {
    projectId,
    ...mapLegacyTicketListQueryParamsKey(
      paramsKey,
      legacySortKey,
      legacySearch,
      legacyLimit
    ),
  };
};
