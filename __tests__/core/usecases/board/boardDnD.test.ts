import type { Ticket } from "@/core/domain/schema/ticket.schema";

import {
  buildBoardTicketIds,
  buildNextBoardFromDragOver,
  buildTicketLocationIndex,
} from "@/core/usecases/board/boardDnD";

import { BOARD_COLUMN_DROP_PREFIX } from "@/shared/constants/board";
import type { BoardColumnConfig } from "@/shared/types/board";

describe("boardDnD usecase helpers", () => {
  const columns: BoardColumnConfig[] = [
    {
      id: "todo-column",
      title: "Todo",
      status: "todo",
      state: "todo",
    },
    {
      id: "doing-column",
      title: "In Progress",
      status: "in-progress",
      state: "in_progress",
    },
    {
      id: "done-column",
      title: "Done",
      status: "done",
      state: "done",
    },
  ];

  const createTicket = (
    id: string,
    status: string,
    position: number
  ): Ticket => ({
    id,
    projectId: "project-1",
    title: `Ticket ${id}`,
    description: null,
    status,
    position,
    codeNumber: position + 1,
    epicId: null,
    parentId: null,
    sprintId: null,
    priority: null,
    dueDate: null,
    storyPoints: null,
    createdBy: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  });

  describe("buildBoardTicketIds", () => {
    it("groups tickets by matching column status and keeps every column key", () => {
      const tickets = [
        createTicket("ticket-2", "todo", 2),
        createTicket("ticket-3", "in-progress", 0),
        createTicket("ticket-1", "todo", 1),
        createTicket("ticket-4", "unknown", 3),
      ];

      const result = buildBoardTicketIds(columns, tickets);

      expect(result).toEqual({
        "todo-column": ["ticket-1", "ticket-2"],
        "doing-column": ["ticket-3"],
        "done-column": [],
      });
    });
  });

  describe("buildNextBoardFromDragOver", () => {
    it("reorders a ticket inside the same column when dragged over another ticket", () => {
      const previous = {
        "todo-column": ["ticket-1", "ticket-2", "ticket-3"],
        "doing-column": ["ticket-4"],
      };
      const previousLocationIndex = buildTicketLocationIndex(previous);

      const result = buildNextBoardFromDragOver(
        previous,
        previousLocationIndex,
        "ticket-1",
        "ticket-3"
      );

      expect(result).toEqual({
        "todo-column": ["ticket-2", "ticket-3", "ticket-1"],
        "doing-column": ["ticket-4"],
      });
    });

    it("returns previous board when drag-over does not change position", () => {
      const previous = {
        "todo-column": ["ticket-1", "ticket-2"],
      };
      const previousLocationIndex = buildTicketLocationIndex(previous);

      const result = buildNextBoardFromDragOver(
        previous,
        previousLocationIndex,
        "ticket-1",
        "ticket-1"
      );

      expect(result).toBe(previous);
    });

    it("moves a ticket to another column when dragged over a ticket", () => {
      const previous = {
        "todo-column": ["ticket-1", "ticket-2"],
        "doing-column": ["ticket-3", "ticket-4"],
      };
      const previousLocationIndex = buildTicketLocationIndex(previous);

      const result = buildNextBoardFromDragOver(
        previous,
        previousLocationIndex,
        "ticket-2",
        "ticket-4"
      );

      expect(result).toEqual({
        "todo-column": ["ticket-1"],
        "doing-column": ["ticket-3", "ticket-2", "ticket-4"],
      });
    });

    it("appends a moved ticket when dragged over a column drop zone", () => {
      const previous = {
        "todo-column": ["ticket-1", "ticket-2"],
        "doing-column": ["ticket-3", "ticket-4"],
      };
      const previousLocationIndex = buildTicketLocationIndex(previous);

      const result = buildNextBoardFromDragOver(
        previous,
        previousLocationIndex,
        "ticket-2",
        `${BOARD_COLUMN_DROP_PREFIX}doing-column`
      );

      expect(result).toEqual({
        "todo-column": ["ticket-1"],
        "doing-column": ["ticket-3", "ticket-4", "ticket-2"],
      });
    });

    it("returns previous board when dragged over drop-zone of same column", () => {
      const previous = {
        "todo-column": ["ticket-1", "ticket-2"],
      };
      const previousLocationIndex = buildTicketLocationIndex(previous);

      const result = buildNextBoardFromDragOver(
        previous,
        previousLocationIndex,
        "ticket-1",
        `${BOARD_COLUMN_DROP_PREFIX}todo-column`
      );

      expect(result).toBe(previous);
    });

    it("returns previous board when active or over ticket cannot be resolved", () => {
      const previous = {
        "todo-column": ["ticket-1", "ticket-2"],
      };
      const previousLocationIndex = buildTicketLocationIndex(previous);

      const result = buildNextBoardFromDragOver(
        previous,
        previousLocationIndex,
        "unknown-ticket",
        "ticket-2"
      );

      expect(result).toBe(previous);
    });
  });
});
