import type { TicketFilters } from "@/modules/board/core/domain/ticket.types";

export const omitParentIdFilter = (filters: TicketFilters): TicketFilters => {
  return filters;
};
