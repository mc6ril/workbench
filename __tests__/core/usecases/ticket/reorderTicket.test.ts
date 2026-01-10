import { z } from "zod";

import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { reorderTicket } from "@/core/usecases/ticket/reorderTicket";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

describe("reorderTicket", () => {
  const projectId = "223e4567-e89b-12d3-a456-426614174000";

  const mockTicket1: Ticket = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    projectId,
    title: "Ticket 1",
    description: "First ticket",
    status: "todo",
    position: 0,
    epicId: null,
    parentId: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockTicket2: Ticket = {
    id: "323e4567-e89b-12d3-a456-426614174001",
    projectId,
    title: "Ticket 2",
    description: "Second ticket",
    status: "todo",
    position: 1,
    epicId: null,
    parentId: null,
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  const updatedTicket1: Ticket = {
    ...mockTicket1,
    position: 1,
    updatedAt: new Date("2024-01-03T00:00:00Z"),
  };

  const updatedTicket2: Ticket = {
    ...mockTicket2,
    position: 0,
    updatedAt: new Date("2024-01-03T00:00:00Z"),
  };

  it("should reorder tickets with valid input", async () => {
    // Arrange
    const input = {
      ticketPositions: [
        { id: mockTicket1.id, position: 1 },
        { id: mockTicket2.id, position: 0 },
      ],
    };
    const updatedTickets = [updatedTicket1, updatedTicket2];
    const repository = createTicketRepositoryMock({
      updatePositions: jest.fn<
        Promise<Ticket[]>,
        [Array<{ id: string; position: number }>]
      >(async () => updatedTickets),
    });

    // Act
    const result = await reorderTicket(repository, input);

    // Assert
    expect(repository.updatePositions).toHaveBeenCalledTimes(1);
    expect(repository.updatePositions).toHaveBeenCalledWith(
      input.ticketPositions
    );
    expect(result).toEqual(updatedTickets);
  });

  it("should throw ZodError on empty ticket positions array", async () => {
    // Arrange
    const input = {
      ticketPositions: [],
    };
    const repository = createTicketRepositoryMock();

    // Act & Assert
    await expect(reorderTicket(repository, input)).rejects.toThrow(z.ZodError);
    expect(repository.updatePositions).not.toHaveBeenCalled();
  });

  it("should throw ZodError on invalid ticket ID", async () => {
    // Arrange
    const input = {
      ticketPositions: [
        { id: "invalid-uuid", position: 0 },
      ],
    };
    const repository = createTicketRepositoryMock();

    // Act & Assert
    await expect(reorderTicket(repository, input)).rejects.toThrow(z.ZodError);
    expect(repository.updatePositions).not.toHaveBeenCalled();
  });

  it("should throw ZodError on negative position", async () => {
    // Arrange
    const input = {
      ticketPositions: [
        { id: mockTicket1.id, position: -1 },
      ],
    };
    const repository = createTicketRepositoryMock();

    // Act & Assert
    await expect(reorderTicket(repository, input)).rejects.toThrow(z.ZodError);
    expect(repository.updatePositions).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const input = {
      ticketPositions: [
        { id: mockTicket1.id, position: 1 },
      ],
    };
    const repositoryError = new Error("Database connection failed");
    const repository = createTicketRepositoryMock({
      updatePositions: jest.fn<
        Promise<Ticket[]>,
        [Array<{ id: string; position: number }>]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(reorderTicket(repository, input)).rejects.toThrow(
      repositoryError
    );
    expect(repository.updatePositions).toHaveBeenCalledTimes(1);
  });
});
