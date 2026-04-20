import { createBoardRepositoryMock } from "../../../../__mocks__/core/ports/boardRepository";
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

import type { Board, Column } from "@/modules/board/core/domain/board.types";
import type {
  Ticket,
  UpdateTicketInput,
} from "@/modules/board/core/domain/ticket.types";
import { updateTicket } from "@/modules/board/core/usecases/ticket/updateTicket";

describe("updateTicket completedAt workflow logic", () => {
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";
  const projectId = "223e4567-e89b-12d3-a456-426614174000";
  const boardId = "323e4567-e89b-12d3-a456-426614174000";
  const todoColumnId = "423e4567-e89b-12d3-a456-426614174000";
  const doneColumnId = "523e4567-e89b-12d3-a456-426614174000";
  const board: Board = {
    id: boardId,
    projectId,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };
  const columns: Column[] = [
    {
      id: todoColumnId,
      boardId,
      name: "Todo",
      key: "todo",
      state: "todo",
      position: 0,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
    {
      id: doneColumnId,
      boardId,
      name: "Done",
      key: "completed",
      state: "done",
      position: 1,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
  ];

  const baseTicket: Ticket = {
    id: ticketId,
    projectId,
    title: "Test Ticket",
    description: null,
    columnId: todoColumnId,
    position: 0,
    codeNumber: 1,
    priority: null,
    dueDate: null,
    storyPoints: null,
    createdBy: null,
    completedAt: null,
    archivedAt: null,
    archivedWeekStart: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-25T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sets completedAt when a ticket enters a done column", async () => {
    const now = new Date("2026-03-25T12:00:00.000Z");
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => board
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => columns
      ),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => baseTicket
      ),
      update: jest.fn<Promise<Ticket>, [string, UpdateTicketInput]>(
        async (_id, input) => ({
          ...baseTicket,
          columnId: input.columnId ?? baseTicket.columnId,
          completedAt:
            input.completedAt !== undefined
              ? input.completedAt
              : baseTicket.completedAt,
        })
      ),
    });

    await updateTicket(repository, boardRepository, ticketId, {
      columnId: doneColumnId,
    });

    expect(repository.update).toHaveBeenCalledWith(ticketId, {
      columnId: doneColumnId,
      completedAt: now,
    });
  });

  it("clears completedAt when a ticket leaves a done column", async () => {
    const completedTicket: Ticket = {
      ...baseTicket,
      columnId: doneColumnId,
      completedAt: new Date("2026-03-24T08:00:00.000Z"),
    };
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => board
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => columns
      ),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => completedTicket
      ),
      update: jest.fn<Promise<Ticket>, [string, UpdateTicketInput]>(
        async (_id, input) => ({
          ...completedTicket,
          columnId: input.columnId ?? completedTicket.columnId,
          completedAt:
            input.completedAt !== undefined
              ? input.completedAt
              : completedTicket.completedAt,
        })
      ),
    });

    await updateTicket(repository, boardRepository, ticketId, {
      columnId: todoColumnId,
    });

    expect(repository.update).toHaveBeenCalledWith(ticketId, {
      columnId: todoColumnId,
      completedAt: null,
    });
  });

  it("preserves completedAt when status is unchanged", async () => {
    const completedTicket: Ticket = {
      ...baseTicket,
      columnId: doneColumnId,
      completedAt: new Date("2026-03-24T08:00:00.000Z"),
    };
    const boardRepository = createBoardRepositoryMock();
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => completedTicket
      ),
      update: jest.fn<Promise<Ticket>, [string, UpdateTicketInput]>(
        async (_id, input) => ({
          ...completedTicket,
          title: input.title ?? completedTicket.title,
          completedAt: input.completedAt ?? completedTicket.completedAt,
        })
      ),
    });

    await updateTicket(repository, boardRepository, ticketId, {
      title: "Updated title",
    });

    expect(repository.update).toHaveBeenCalledWith(ticketId, {
      title: "Updated title",
      completedAt: undefined,
    });
    expect(boardRepository.findByProject).not.toHaveBeenCalled();
  });
});
