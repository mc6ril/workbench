import { z } from "zod";

import { createBoardRepositoryMock } from "../../../../__mocks__/core/ports/boardRepository";
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

import type { Board, Column } from "@/modules/board/core/domain/schema/board.schema";
import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import { moveTicket } from "@/modules/board/core/usecases/ticket/moveTicket";

describe("moveTicket", () => {
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";
  const projectId = "223e4567-e89b-12d3-a456-426614174000";
  const boardId = "323e4567-e89b-12d3-a456-426614174000";
  const board: Board = {
    id: boardId,
    projectId,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };
  const columns: Column[] = [
    {
      id: "todo-column",
      boardId,
      name: "Todo",
      status: "todo",
      state: "todo",
      position: 0,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
    {
      id: "done-column",
      boardId,
      name: "Done",
      status: "completed",
      state: "done",
      position: 1,
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
    status: "todo",
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
    jest.useFakeTimers().setSystemTime(new Date("2026-03-25T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const updatedTicket: Ticket = {
    ...mockTicket,
    status: "in-progress",
    position: 1,
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  it("should move ticket to new status and position", async () => {
    // Arrange
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => mockTicket
      ),
      moveTicket: jest.fn<Promise<Ticket>, [string, string, number, Date | null]>(
        async () => updatedTicket
      ),
    });

    // Act
    const result = await moveTicket(
      repository,
      boardRepository,
      ticketId,
      "in-progress",
      1
    );

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(ticketId);
    expect(repository.moveTicket).toHaveBeenCalledTimes(1);
    expect(repository.moveTicket).toHaveBeenCalledWith(
      ticketId,
      "in-progress",
      1,
      null
    );
    expect(result).toEqual(updatedTicket);
  });

  it("should set completedAt when moving a ticket into a done column", async () => {
    const now = new Date("2026-03-25T10:00:00.000Z");
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(async () => mockTicket),
      moveTicket: jest.fn<
        Promise<Ticket>,
        [string, string, number, Date | null]
      >(async () => ({
        ...mockTicket,
        status: "completed",
        position: 1,
        completedAt: now,
      })),
    });

    await moveTicket(repository, boardRepository, ticketId, "completed", 1);

    expect(repository.moveTicket).toHaveBeenCalledWith(
      ticketId,
      "completed",
      1,
      now
    );
  });

  it("should clear completedAt when moving a ticket out of a done column", async () => {
    const completedTicket: Ticket = {
      ...mockTicket,
      status: "completed",
      completedAt: new Date("2026-03-24T09:00:00.000Z"),
    };
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => completedTicket
      ),
      moveTicket: jest.fn<
        Promise<Ticket>,
        [string, string, number, Date | null]
      >(async () => ({
        ...completedTicket,
        status: "todo",
        completedAt: null,
      })),
    });

    await moveTicket(repository, boardRepository, ticketId, "todo", 0);

    expect(repository.moveTicket).toHaveBeenCalledWith(
      ticketId,
      "todo",
      0,
      null
    );
  });

  it("should throw ZodError on invalid status", async () => {
    // Arrange
    const boardRepository = createBoardRepositoryMock();
    const repository = createTicketRepositoryMock();

    // Act & Assert
    await expect(
      moveTicket(repository, boardRepository, ticketId, "", 1)
    ).rejects.toThrow(z.ZodError);
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.moveTicket).not.toHaveBeenCalled();
  });

  it("should throw ZodError on invalid position", async () => {
    // Arrange
    const boardRepository = createBoardRepositoryMock();
    const repository = createTicketRepositoryMock();

    // Act & Assert
    await expect(
      moveTicket(repository, boardRepository, ticketId, "in-progress", -1)
    ).rejects.toThrow(z.ZodError);
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.moveTicket).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when ticket not found", async () => {
    // Arrange
    const boardRepository = createBoardRepositoryMock();
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(async () => null),
    });

    // Act & Assert
    await expect(
      moveTicket(repository, boardRepository, ticketId, "in-progress", 1)
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      entityType: "Ticket",
      entityId: ticketId,
    });
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.moveTicket).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database connection failed");
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => mockTicket
      ),
      moveTicket: jest.fn<
        Promise<Ticket>,
        [string, string, number, Date | null]
      >(
        async () => {
          throw repositoryError;
        }
      ),
    });

    // Act & Assert
    await expect(
      moveTicket(repository, boardRepository, ticketId, "in-progress", 1)
    ).rejects.toThrow(repositoryError);
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.moveTicket).toHaveBeenCalledTimes(1);
  });
});
