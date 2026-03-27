import type {
  TicketFilters,
  TicketSort,
} from "@/modules/board/core/domain/schema/ticket.schema";
import { TICKET_PRIORITY_VALUES } from "@/modules/board/core/domain/schema/ticket.schema";

export type TicketListFilterKey = readonly [
  status: TicketFilters["status"] | null,
  priority: TicketFilters["priority"] | null,
];

export type TicketListSortKey = readonly [
  field: TicketSort["field"],
  direction: TicketSort["direction"],
];

export type TicketListQueryKeyDescriptor = {
  projectId: string;
  filters: {
    status: TicketFilters["status"] | null;
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

  return [
    filters.status ?? null,
    filters.priority ?? null,
  ] as const;
};

export const createTicketListSortKey = (
  sort?: TicketSort
): TicketListSortKey | null => {
  return sort ? ([sort.field, sort.direction] as const) : null;
};

const isTicketPriority = (
  value: unknown
): value is NonNullable<TicketFilters["priority"]> => {
  return (
    typeof value === "string" &&
    (TICKET_PRIORITY_VALUES as readonly string[]).includes(value)
  );
};

const mapTicketListFilterKey = (
  filterKey: unknown
): TicketListQueryKeyDescriptor["filters"] => {
  if (!Array.isArray(filterKey)) {
    return null;
  }

  const [status, priority] = filterKey;

  return {
    status: typeof status === "string" ? status : null,
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

  if (typeof field !== "string" || typeof direction !== "string") {
    return null;
  }

  return {
    field: field as TicketSort["field"],
    direction: direction as TicketSort["direction"],
  };
};

export const mapTicketListQueryKey = (
  queryKey: readonly unknown[]
): TicketListQueryKeyDescriptor | null => {
  if (
    queryKey[0] !== "projects" ||
    typeof queryKey[1] !== "string" ||
    queryKey[2] !== "tickets" ||
    queryKey[3] !== "list"
  ) {
    return null;
  }

  return {
    projectId: queryKey[1],
    filters: mapTicketListFilterKey(queryKey[4]),
    sort: mapTicketListSortKey(queryKey[5]),
    search: typeof queryKey[6] === "string" ? queryKey[6] : null,
    limit: typeof queryKey[7] === "number" ? queryKey[7] : null,
  };
};
