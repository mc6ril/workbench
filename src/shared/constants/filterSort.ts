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
  PRIORITY: ticketSortFields.priority,
  SPRINT: ticketSortFields.sprint,
  DUE_DATE: ticketSortFields.dueDate,
});

export const EPIC_PROGRESS_FILTER_VALUES = Object.freeze({
  ALL: "all",
  NOT_STARTED: "notStarted",
  IN_PROGRESS: "inProgress",
  COMPLETED: "completed",
});

export const EPIC_SORT_FIELD_VALUES = Object.freeze({
  UPDATED_AT: "updatedAt",
  CREATED_AT: "createdAt",
  NAME: "name",
  PROGRESS: "progress",
});

export const SORT_DIRECTION_VALUES = Object.freeze({
  ASC: sortDirections.asc,
  DESC: sortDirections.desc,
});
