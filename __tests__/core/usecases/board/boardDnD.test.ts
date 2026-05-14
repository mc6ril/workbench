import { BOARD_COLUMN_DROP_PREFIX } from "@/modules/board/constants/board";
import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import {
  buildBoardTicketIds,
  buildNextBoardFromDragOver,
  buildTicketLocationIndex,
  cloneTicketLocationIndex,
  syncTicketLocationIndexColumns,
} from "@/modules/board/core/usecases/board/boardDnD";
import type { BoardColumnConfig } from "@/modules/board/presentation/types/boardView.types";

describe("boardDnD usecase helpers", () => {
  const columns: BoardColumnConfig[] = [
    {
      id: "todo-column",
      title: "Todo",
      key: "todo",
      state: "todo",
    },
    {
      id: "doing-column",
      title: "In Progress",
      key: "in-progress",
      state: "in_progress",
    },
    {
      id: "done-column",
      title: "Done",
      key: "done",
      state: "done",
    },
  ];

  const createTicket = (
    id: string,
    columnId: string,
    position: number
  ): Ticket => ({
    id,
    projectId: "project-1",
    title: `Ticket ${id}`,
    description: null,
    columnId,
    position,
    codeNumber: position + 1,
    priority: null,
    dueDate: null,
    storyPoints: null,
    createdBy: null,
    completedAt: null,
    archivedAt: null,
    archivedWeekStart: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    checklist: [],
  });

  describe("buildBoardTicketIds", () => {
    it("groups tickets by column id and keeps every column key", () => {
      const tickets = [
        createTicket("ticket-2", "todo-column", 2),
        createTicket("ticket-3", "doing-column", 0),
        createTicket("ticket-1", "todo-column", 1),
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

  describe("cloneTicketLocationIndex", () => {
    it("creates a deep clone that can be mutated independently", () => {
      const previous = {
        "todo-column": ["ticket-1", "ticket-2"],
        "doing-column": ["ticket-3"],
      };
      const locationIndex = buildTicketLocationIndex(previous);

      const clone = cloneTicketLocationIndex(locationIndex);

      expect(clone).toEqual(locationIndex);
      expect(clone).not.toBe(locationIndex);
      expect(clone["ticket-1"]).not.toBe(locationIndex["ticket-1"]);
    });
  });

  describe("syncTicketLocationIndexColumns", () => {
    it("updates only the source and target columns after a cross-column move", () => {
      const previous = {
        "todo-column": ["ticket-1", "ticket-2"],
        "doing-column": ["ticket-3"],
        "done-column": ["ticket-4"],
      };
      const locationIndex = buildTicketLocationIndex(previous);
      const unaffectedLocation = locationIndex["ticket-4"];
      const nextBoard = buildNextBoardFromDragOver(
        previous,
        locationIndex,
        "ticket-2",
        "ticket-3"
      );

      syncTicketLocationIndexColumns(locationIndex, nextBoard, [
        "todo-column",
        "doing-column",
      ]);

      expect(locationIndex).toEqual(buildTicketLocationIndex(nextBoard));
      expect(locationIndex["ticket-4"]).toBe(unaffectedLocation);
    });
  });
});
