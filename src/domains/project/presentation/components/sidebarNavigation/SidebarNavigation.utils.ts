import type { TicketFilters } from "@/modules/board/core/domain/schema/ticket.schema";

export const omitParentIdFilter = (filters: TicketFilters): TicketFilters => {
  return filters;
};
