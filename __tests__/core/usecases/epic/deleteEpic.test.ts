import type { Epic } from "@/core/domain/schema/epic.schema";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { deleteEpic } from "@/core/usecases/epic/deleteEpic";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createEpicRepositoryMock } from "../../../../__mocks__/core/ports/epicRepository";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

describe("deleteEpic", () => {
  const epicId = "123e4567-e89b-12d3-a456-426614174000";
  const projectId = "223e4567-e89b-12d3-a456-426614174000";

  const mockEpic: Epic = {
    id: epicId,
    projectId,
    name: "Test Epic",
    description: "Test description",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockTicket1: Ticket = {
    id: "323e4567-e89b-12d3-a456-426614174000",
    projectId,
    title: "Ticket 1",
    description: "First ticket",
    status: "todo",
    position: 0,
    epicId,
    parentId: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockTicket2: Ticket = {
    id: "423e4567-e89b-12d3-a456-426614174001",
    projectId,
    title: "Ticket 2",
    description: "Second ticket",
    status: "in-progress",
    position: 1,
    epicId,
    parentId: null,
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  it("should delete epic with no assigned tickets", async () => {
    // Arrange
    const epicRepository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(async () => []),
      delete: jest.fn<Promise<void>, [string]>(async () => undefined),
    });
    const ticketRepository = createTicketRepositoryMock();

    // Act
    await deleteEpic(epicRepository, ticketRepository, epicId);

    // Assert
    expect(epicRepository.findById).toHaveBeenCalledTimes(1);
    expect(epicRepository.findById).toHaveBeenCalledWith(epicId);
    expect(epicRepository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(epicRepository.listTicketsByEpic).toHaveBeenCalledWith(epicId);
    expect(ticketRepository.unassignFromEpic).not.toHaveBeenCalled();
    expect(epicRepository.delete).toHaveBeenCalledTimes(1);
    expect(epicRepository.delete).toHaveBeenCalledWith(epicId);
  });

  it("should delete epic and unassign all tickets", async () => {
    // Arrange
    const tickets = [mockTicket1, mockTicket2];
    const epicRepository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => tickets
      ),
      delete: jest.fn<Promise<void>, [string]>(async () => undefined),
    });
    const unassignedTicket1 = {
      ...mockTicket1,
      epicId: null,
    };
    const unassignedTicket2 = {
      ...mockTicket2,
      epicId: null,
    };
    const ticketRepository = createTicketRepositoryMock({
      unassignFromEpic: jest.fn<Promise<Ticket>, [string]>(
        async (ticketId) => {
          if (ticketId === mockTicket1.id) return unassignedTicket1;
          if (ticketId === mockTicket2.id) return unassignedTicket2;
          throw new Error("Unexpected ticket ID");
        }
      ),
    });

    // Act
    await deleteEpic(epicRepository, ticketRepository, epicId);

    // Assert
    expect(epicRepository.findById).toHaveBeenCalledTimes(1);
    expect(epicRepository.findById).toHaveBeenCalledWith(epicId);
    expect(epicRepository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(epicRepository.listTicketsByEpic).toHaveBeenCalledWith(epicId);
    expect(ticketRepository.unassignFromEpic).toHaveBeenCalledTimes(2);
    expect(ticketRepository.unassignFromEpic).toHaveBeenCalledWith(
      mockTicket1.id
    );
    expect(ticketRepository.unassignFromEpic).toHaveBeenCalledWith(
      mockTicket2.id
    );
    expect(epicRepository.delete).toHaveBeenCalledTimes(1);
    expect(epicRepository.delete).toHaveBeenCalledWith(epicId);
  });

  it("should throw NotFoundError when epic not found", async () => {
    // Arrange
    const epicRepository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => null),
    });
    const ticketRepository = createTicketRepositoryMock();

    // Act & Assert
    await expect(
      deleteEpic(epicRepository, ticketRepository, epicId)
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      entityType: "Epic",
      entityId: epicId,
    });
    expect(epicRepository.findById).toHaveBeenCalledTimes(1);
    expect(epicRepository.listTicketsByEpic).not.toHaveBeenCalled();
    expect(ticketRepository.unassignFromEpic).not.toHaveBeenCalled();
    expect(epicRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from findById", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const epicRepository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => {
        throw repositoryError;
      }),
    });
    const ticketRepository = createTicketRepositoryMock();

    // Act & Assert
    await expect(
      deleteEpic(epicRepository, ticketRepository, epicId)
    ).rejects.toThrow(repositoryError);
    expect(epicRepository.findById).toHaveBeenCalledTimes(1);
    expect(epicRepository.listTicketsByEpic).not.toHaveBeenCalled();
    expect(ticketRepository.unassignFromEpic).not.toHaveBeenCalled();
    expect(epicRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from listTicketsByEpic", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const epicRepository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(async () => {
        throw repositoryError;
      }),
    });
    const ticketRepository = createTicketRepositoryMock();

    // Act & Assert
    await expect(
      deleteEpic(epicRepository, ticketRepository, epicId)
    ).rejects.toThrow(repositoryError);
    expect(epicRepository.findById).toHaveBeenCalledTimes(1);
    expect(epicRepository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(ticketRepository.unassignFromEpic).not.toHaveBeenCalled();
    expect(epicRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from unassignFromEpic", async () => {
    // Arrange
    const tickets = [mockTicket1];
    const repositoryError = new Error("Database error");
    const epicRepository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => tickets
      ),
    });
    const ticketRepository = createTicketRepositoryMock({
      unassignFromEpic: jest.fn<Promise<Ticket>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(
      deleteEpic(epicRepository, ticketRepository, epicId)
    ).rejects.toThrow(repositoryError);
    expect(epicRepository.findById).toHaveBeenCalledTimes(1);
    expect(epicRepository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(ticketRepository.unassignFromEpic).toHaveBeenCalledTimes(1);
    expect(ticketRepository.unassignFromEpic).toHaveBeenCalledWith(
      mockTicket1.id
    );
    expect(epicRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from delete", async () => {
    // Arrange
    const epicRepository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(async () => []),
      delete: jest.fn<Promise<void>, [string]>(async () => {
        throw new Error("Database error");
      }),
    });
    const ticketRepository = createTicketRepositoryMock();

    // Act & Assert
    await expect(
      deleteEpic(epicRepository, ticketRepository, epicId)
    ).rejects.toThrow("Database error");
    expect(epicRepository.findById).toHaveBeenCalledTimes(1);
    expect(epicRepository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(epicRepository.delete).toHaveBeenCalledTimes(1);
  });
});
