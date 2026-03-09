import type { TicketFilters } from "@/core/domain/schema/ticket.schema";

export const omitParentIdFilter = (filters: TicketFilters): TicketFilters => {
  if (!Object.prototype.hasOwnProperty.call(filters, "parentId")) {
    return filters;
  }

  const { parentId: _parentId, ...rest } = filters;
  return rest;
};
