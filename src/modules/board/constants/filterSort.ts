import {
  SortDirectionSchema,
  TicketSortFieldSchema,
} from "@/modules/board/core/domain/schema/ticket.schema";

const ticketSortFields = TicketSortFieldSchema.enum;
const sortDirections = SortDirectionSchema.enum;

export const TICKET_SORT_FIELD_VALUES = Object.freeze({
  CREATED_AT: ticketSortFields.createdAt,
  TITLE: ticketSortFields.title,
  POSITION: ticketSortFields.position,
  DUE_DATE: ticketSortFields.dueDate,
});

export const SORT_DIRECTION_VALUES = Object.freeze({
  ASC: sortDirections.asc,
  DESC: sortDirections.desc,
});
