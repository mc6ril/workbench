import { z } from "zod";

import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

import type { Column } from "@/modules/board/core/domain/board.types";
import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import { moveTicket } from "@/modules/board/core/usecases/ticket/moveTicket";

describe("moveTicket", () => {
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";
  const projectId = "223e4567-e89b-12d3-a456-426614174000";
  const boardId = "323e4567-e89b-12d3-a456-426614174000";
  const todoColumnId = "423e4567-e89b-12d3-a456-426614174000";
  const doingColumnId = "523e4567-e89b-12d3-a456-426614174000";
  const doneColumnId = "623e4567-e89b-12d3-a456-426614174000";
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
    checklist: [],
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-25T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const updatedTicket: Ticket = {
    ...mockTicket,
    columnId: doingColumnId,
    position: 1,
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  it("should move ticket to new status and position", async () => {
    // Arrange
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => mockTicket
      ),
      moveTicket: jest.fn<
        Promise<Ticket>,
        [string, string, number, Date | null]
      >(async () => updatedTicket),
    });

    // Act
    const result = await moveTicket(
      repository,
      ticketId,
      doingColumnId,
      1,
      columns
    );

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(ticketId);
    expect(repository.moveTicket).toHaveBeenCalledTimes(1);
    expect(repository.moveTicket).toHaveBeenCalledWith(
      ticketId,
      doingColumnId,
      1,
      null
    );
    expect(result).toEqual(updatedTicket);
  });

  it("should set completedAt when moving a ticket into a done column", async () => {
    const now = new Date("2026-03-25T10:00:00.000Z");
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => mockTicket
      ),
      moveTicket: jest.fn<
        Promise<Ticket>,
        [string, string, number, Date | null]
      >(async () => ({
        ...mockTicket,
        columnId: doneColumnId,
        position: 1,
        completedAt: now,
      })),
    });

    await moveTicket(repository, ticketId, doneColumnId, 1, columns);

    expect(repository.moveTicket).toHaveBeenCalledWith(
      ticketId,
      doneColumnId,
      1,
      now
    );
  });

  it("should clear completedAt when moving a ticket out of a done column", async () => {
    const completedTicket: Ticket = {
      ...mockTicket,
      columnId: doneColumnId,
      completedAt: new Date("2026-03-24T09:00:00.000Z"),
    };
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => completedTicket
      ),
      moveTicket: jest.fn<
        Promise<Ticket>,
        [string, string, number, Date | null]
      >(async () => ({
        ...completedTicket,
        columnId: todoColumnId,
        completedAt: null,
      })),
    });

    await moveTicket(repository, ticketId, todoColumnId, 0, columns);

    expect(repository.moveTicket).toHaveBeenCalledWith(
      ticketId,
      todoColumnId,
      0,
      null
    );
  });

  it("should throw ZodError on invalid column id", async () => {
    // Arrange
    const repository = createTicketRepositoryMock();

    // Act & Assert
    await expect(
      moveTicket(repository, ticketId, "", 1, columns)
    ).rejects.toThrow(z.ZodError);
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.moveTicket).not.toHaveBeenCalled();
  });

  it("should throw ZodError on invalid position", async () => {
    // Arrange
    const repository = createTicketRepositoryMock();

    // Act & Assert
    await expect(
      moveTicket(repository, ticketId, doingColumnId, -1, columns)
    ).rejects.toThrow(z.ZodError);
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.moveTicket).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when ticket not found", async () => {
    // Arrange
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(async () => null),
    });

    // Act & Assert
    await expect(
      moveTicket(repository, ticketId, doingColumnId, 1, columns)
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      context: {
        entityType: "Ticket",
        entityId: ticketId,
      },
    });
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.moveTicket).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database connection failed");
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => mockTicket
      ),
      moveTicket: jest.fn<
        Promise<Ticket>,
        [string, string, number, Date | null]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(
      moveTicket(repository, ticketId, doingColumnId, 1, columns)
    ).rejects.toThrow(repositoryError);
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.moveTicket).toHaveBeenCalledTimes(1);
  });
});
