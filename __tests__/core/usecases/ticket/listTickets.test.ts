import type { Ticket } from "@/core/domain/ticket.schema";

import { listTickets } from "@/core/usecases/ticket/listTickets";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

describe("listTickets", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockTicket1: Ticket = {
    id: "223e4567-e89b-12d3-a456-426614174000",
    projectId,
    title: "Ticket 1",
    description: "First ticket description",
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
    description: "Second ticket description",
    status: "in-progress",
    position: 1,
    epicId: null,
    parentId: null,
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  it("should list tickets for project", async () => {
    // Arrange
    const tickets: Ticket[] = [mockTicket1, mockTicket2];
    const repository = createTicketRepositoryMock({
      listByProject: jest.fn<Promise<Ticket[]>, [string]>(async () => tickets),
    });

    // Act
    const result = await listTickets(repository, projectId);

    // Assert
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listByProject).toHaveBeenCalledWith(projectId);
    expect(result).toEqual(tickets);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: mockTicket1.id,
      title: mockTicket1.title,
      projectId,
    });
    expect(result[1]).toMatchObject({
      id: mockTicket2.id,
      title: mockTicket2.title,
      projectId,
    });
  });

  it("should return empty array when no tickets", async () => {
    // Arrange
    const repository = createTicketRepositoryMock({
      listByProject: jest.fn<Promise<Ticket[]>, [string]>(async () => []),
    });

    // Act
    const result = await listTickets(repository, projectId);

    // Assert
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listByProject).toHaveBeenCalledWith(projectId);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database connection failed");
    const repository = createTicketRepositoryMock({
      listByProject: jest.fn<Promise<Ticket[]>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(listTickets(repository, projectId)).rejects.toThrow(
      repositoryError
    );
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listByProject).toHaveBeenCalledWith(projectId);
  });

  it("should call repository with correct projectId", async () => {
    // Arrange
    const differentProjectId = "456e7890-e89b-12d3-a456-426614174001";
    const repository = createTicketRepositoryMock({
      listByProject: jest.fn<Promise<Ticket[]>, [string]>(async () => []),
    });

    // Act
    await listTickets(repository, differentProjectId);

    // Assert
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listByProject).toHaveBeenCalledWith(differentProjectId);
    expect(repository.listByProject).not.toHaveBeenCalledWith(projectId);
  });
});

