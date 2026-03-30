import { z } from "zod";

import { createNotFoundError } from "@/shared/errors/repositoryError";

import { createBoardRepositoryMock } from "../../../../__mocks__/core/ports/boardRepository";
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

import type { Board, Column } from "@/modules/board/core/domain/board.types";
import type {
  MoveAndReorderTicketInput,
  Ticket,
} from "@/modules/board/core/domain/ticket.types";
import { moveAndReorderTicket } from "@/modules/board/core/usecases/ticket/moveAndReorderTicket";

describe("moveAndReorderTicket", () => {
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";
  const projectId = "223e4567-e89b-12d3-a456-426614174000";
  const boardId = "323e4567-e89b-12d3-a456-426614174000";
  const todoColumnId = "423e4567-e89b-12d3-a456-426614174000";
  const doingColumnId = "523e4567-e89b-12d3-a456-426614174000";
  const doneColumnId = "623e4567-e89b-12d3-a456-426614174000";
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
      id: doingColumnId,
      boardId,
      name: "In Progress",
      key: "in-progress",
      state: "in_progress",
      position: 1,
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
      position: 2,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
  ];

  const mockTicket: Ticket = {
    id: ticketId,
    projectId,
    title: "Test Ticket",
    description: "Test description",
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
    jest.useFakeTimers().setSystemTime(new Date("2026-03-25T11:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  type RepositoryMoveAndReorderInput = {
    ticketId: string;
    columnId: string;
    position: number;
    completedAt: Date | null;
    ticketPositions: Array<{ id: string; position: number }>;
  };

  it("should atomically move and reorder tickets", async () => {
    const now = new Date("2026-03-25T11:00:00.000Z");
    const input: MoveAndReorderTicketInput = {
      ticketId,
      columnId: doneColumnId,
      position: 1,
      ticketPositions: [{ id: ticketId, position: 1 }],
    };
    const updatedTickets: Ticket[] = [
      {
        ...mockTicket,
        columnId: doneColumnId,
        position: 1,
        completedAt: now,
      },
    ];
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(async () => mockTicket),
      moveAndReorderTicket: jest.fn<
        Promise<Ticket[]>,
        [RepositoryMoveAndReorderInput]
      >(
        async () => updatedTickets
      ),
    });

    const result = await moveAndReorderTicket(repository, boardRepository, input);

    expect(repository.moveAndReorderTicket).toHaveBeenCalledTimes(1);
    expect(repository.moveAndReorderTicket).toHaveBeenCalledWith({
      ...input,
      completedAt: now,
    });
    expect(result).toEqual(updatedTickets);
  });

  it("should allow empty ticketPositions", async () => {
    const input: MoveAndReorderTicketInput = {
      ticketId,
      columnId: doingColumnId,
      position: 1,
      ticketPositions: [],
    };
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(async () => mockTicket),
      moveAndReorderTicket: jest.fn<
        Promise<Ticket[]>,
        [RepositoryMoveAndReorderInput]
      >(
        async () => [
          {
            ...mockTicket,
            columnId: doingColumnId,
            position: 1,
          },
        ]
      ),
    });

    await expect(
      moveAndReorderTicket(repository, boardRepository, input)
    ).resolves.toEqual([
      {
        ...mockTicket,
        columnId: doingColumnId,
        position: 1,
      },
    ]);
    expect(repository.moveAndReorderTicket).toHaveBeenCalledTimes(1);
  });

  it("should throw ZodError on invalid ticketId", async () => {
    const boardRepository = createBoardRepositoryMock();
    const repository = createTicketRepositoryMock();

    await expect(
      moveAndReorderTicket(repository, boardRepository, {
        ticketId: "invalid-id",
        columnId: doingColumnId,
        position: 1,
        ticketPositions: [],
      })
    ).rejects.toThrow(z.ZodError);
    expect(repository.moveAndReorderTicket).not.toHaveBeenCalled();
  });

  it("should propagate NotFoundError from repository", async () => {
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(async () => mockTicket),
      moveAndReorderTicket: jest.fn<
        Promise<Ticket[]>,
        [RepositoryMoveAndReorderInput]
      >(async () => {
        throw createNotFoundError("Ticket", ticketId);
      }),
    });

    await expect(
      moveAndReorderTicket(repository, boardRepository, {
        ticketId,
        columnId: doingColumnId,
        position: 1,
        ticketPositions: [{ id: ticketId, position: 1 }],
      })
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      context: {
        entityType: "Ticket",
        entityId: ticketId,
      },
    });
    expect(repository.moveAndReorderTicket).toHaveBeenCalledTimes(1);
  });

  it("should throw NotFoundError when the ticket does not exist", async () => {
    const boardRepository = createBoardRepositoryMock();
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(async () => null),
    });

    await expect(
      moveAndReorderTicket(repository, boardRepository, {
        ticketId,
        columnId: doneColumnId,
        position: 1,
        ticketPositions: [],
      })
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      context: {
        entityType: "Ticket",
        entityId: ticketId,
      },
    });
    expect(repository.moveAndReorderTicket).not.toHaveBeenCalled();
  });
});
