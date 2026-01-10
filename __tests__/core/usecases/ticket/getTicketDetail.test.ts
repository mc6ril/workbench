import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { getTicketDetail } from "@/core/usecases/ticket/getTicketDetail";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

describe("getTicketDetail", () => {
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

  it("should return ticket when found", async () => {
    // Arrange
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => mockTicket
      ),
    });

    // Act
    const result = await getTicketDetail(repository, ticketId);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(ticketId);
    expect(result).toEqual(mockTicket);
  });

  it("should throw NotFoundError when ticket not found", async () => {
    // Arrange
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(async () => null),
    });

    // Act & Assert
    await expect(getTicketDetail(repository, ticketId)).rejects.toMatchObject({
      code: "NOT_FOUND",
      entityType: "Ticket",
      entityId: ticketId,
    });
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(ticketId);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database connection failed");
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(getTicketDetail(repository, ticketId)).rejects.toThrow(
      repositoryError
    );
    expect(repository.findById).toHaveBeenCalledTimes(1);
  });
});
