import { z } from "zod";

import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { moveTicket } from "@/core/usecases/ticket/moveTicket";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

describe("moveTicket", () => {
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";
  const projectId = "223e4567-e89b-12d3-a456-426614174000";

  const mockTicket: Ticket = {
    id: ticketId,
    projectId,
    title: "Test Ticket",
    description: "Test description",
    status: "todo",
    position: 0,
    epicId: null,
    parentId: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const updatedTicket: Ticket = {
    ...mockTicket,
    status: "in-progress",
    position: 1,
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  it("should move ticket to new status and position", async () => {
    // Arrange
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => mockTicket
      ),
      moveTicket: jest.fn<Promise<Ticket>, [string, string, number]>(
        async () => updatedTicket
      ),
    });

    // Act
    const result = await moveTicket(repository, ticketId, "in-progress", 1);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(ticketId);
    expect(repository.moveTicket).toHaveBeenCalledTimes(1);
    expect(repository.moveTicket).toHaveBeenCalledWith(
      ticketId,
      "in-progress",
      1
    );
    expect(result).toEqual(updatedTicket);
  });

  it("should throw ZodError on invalid status", async () => {
    // Arrange
    const repository = createTicketRepositoryMock();

    // Act & Assert
    await expect(moveTicket(repository, ticketId, "", 1)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.moveTicket).not.toHaveBeenCalled();
  });

  it("should throw ZodError on invalid position", async () => {
    // Arrange
    const repository = createTicketRepositoryMock();

    // Act & Assert
    await expect(
      moveTicket(repository, ticketId, "in-progress", -1)
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
      moveTicket(repository, ticketId, "in-progress", 1)
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
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => mockTicket
      ),
      moveTicket: jest.fn<Promise<Ticket>, [string, string, number]>(
        async () => {
          throw repositoryError;
        }
      ),
    });

    // Act & Assert
    await expect(
      moveTicket(repository, ticketId, "in-progress", 1)
    ).rejects.toThrow(repositoryError);
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.moveTicket).toHaveBeenCalledTimes(1);
  });
});
