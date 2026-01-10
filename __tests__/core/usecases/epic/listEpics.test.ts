import type { Epic } from "@/core/domain/schema/epic.schema";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { listEpics } from "@/core/usecases/epic/listEpics";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createEpicRepositoryMock } from "../../../../__mocks__/core/ports/epicRepository";

describe("listEpics", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockEpic1: Epic = {
    id: "223e4567-e89b-12d3-a456-426614174000",
    projectId,
    name: "Epic 1",
    description: "First epic",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockEpic2: Epic = {
    id: "323e4567-e89b-12d3-a456-426614174001",
    projectId,
    name: "Epic 2",
    description: "Second epic",
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  const mockTicket1: Ticket = {
    id: "423e4567-e89b-12d3-a456-426614174000",
    projectId,
    title: "Ticket 1",
    description: "First ticket",
    status: "completed",
    position: 0,
    epicId: mockEpic1.id,
    parentId: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockTicket2: Ticket = {
    id: "523e4567-e89b-12d3-a456-426614174001",
    projectId,
    title: "Ticket 2",
    description: "Second ticket",
    status: "in-progress",
    position: 1,
    epicId: mockEpic1.id,
    parentId: null,
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  const mockTicket3: Ticket = {
    id: "623e4567-e89b-12d3-a456-426614174002",
    projectId,
    title: "Ticket 3",
    description: "Third ticket",
    status: "completed",
    position: 2,
    epicId: mockEpic1.id,
    parentId: null,
    createdAt: new Date("2024-01-03T00:00:00Z"),
    updatedAt: new Date("2024-01-03T00:00:00Z"),
  };

  it("should return epics with progress", async () => {
    // Arrange
    const epics: Epic[] = [mockEpic1, mockEpic2];
    const epic1Tickets: Ticket[] = [mockTicket1, mockTicket2, mockTicket3]; // 2 completed, 1 in-progress = 66%
    const epic2Tickets: Ticket[] = []; // No tickets = 0%

    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => epics),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(async (epicId) => {
        if (epicId === mockEpic1.id) return epic1Tickets;
        if (epicId === mockEpic2.id) return epic2Tickets;
        return [];
      }),
    });

    // Act
    const result = await listEpics(repository, projectId);

    // Assert
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listByProject).toHaveBeenCalledWith(projectId);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(2);
    expect(repository.listTicketsByEpic).toHaveBeenCalledWith(mockEpic1.id);
    expect(repository.listTicketsByEpic).toHaveBeenCalledWith(mockEpic2.id);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      ...mockEpic1,
      progress: 67, // 2/3 = 66.67% rounded to 67%
    });
    expect(result[1]).toMatchObject({
      ...mockEpic2,
      progress: 0, // No tickets = 0%
    });
  });

  it("should return empty array when no epics", async () => {
    // Arrange
    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => []),
    });

    // Act
    const result = await listEpics(repository, projectId);

    // Assert
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listByProject).toHaveBeenCalledWith(projectId);
    expect(repository.listTicketsByEpic).not.toHaveBeenCalled();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("should return epic with 0% progress when no tickets", async () => {
    // Arrange
    const epics: Epic[] = [mockEpic1];
    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => epics),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(async () => []),
    });

    // Act
    const result = await listEpics(repository, projectId);

    // Assert
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledWith(mockEpic1.id);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      ...mockEpic1,
      progress: 0,
    });
  });

  it("should return epic with 100% progress when all tickets completed", async () => {
    // Arrange
    const epics: Epic[] = [mockEpic1];
    const allCompletedTickets: Ticket[] = [
      { ...mockTicket1, status: "completed" },
      { ...mockTicket2, status: "completed" },
      { ...mockTicket3, status: "completed" },
    ];
    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => epics),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => allCompletedTickets
      ),
    });

    // Act
    const result = await listEpics(repository, projectId);

    // Assert
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      ...mockEpic1,
      progress: 100, // 3/3 = 100%
    });
  });

  it("should return epic with 0% progress when no tickets completed", async () => {
    // Arrange
    const epics: Epic[] = [mockEpic1];
    const noCompletedTickets: Ticket[] = [
      { ...mockTicket1, status: "todo" },
      { ...mockTicket2, status: "in-progress" },
    ];
    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => epics),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => noCompletedTickets
      ),
    });

    // Act
    const result = await listEpics(repository, projectId);

    // Assert
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      ...mockEpic1,
      progress: 0, // 0/2 = 0%
    });
  });

  it("should calculate progress correctly for mixed ticket statuses", async () => {
    // Arrange
    const epics: Epic[] = [mockEpic1];
    const mixedTickets: Ticket[] = [
      { ...mockTicket1, status: "completed" },
      { ...mockTicket2, status: "todo" },
      { ...mockTicket3, status: "completed" },
    ]; // 2 completed, 1 todo = 66.67% rounded to 67%
    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => epics),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => mixedTickets
      ),
    });

    // Act
    const result = await listEpics(repository, projectId);

    // Assert
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      ...mockEpic1,
      progress: 67, // 2/3 = 66.67% rounded to 67%
    });
  });

  it("should propagate repository errors from listByProject", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(listEpics(repository, projectId)).rejects.toThrow(
      repositoryError
    );
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from listTicketsByEpic", async () => {
    // Arrange
    const epics: Epic[] = [mockEpic1];
    const repositoryError = new Error("Database error");
    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => epics),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(listEpics(repository, projectId)).rejects.toThrow(
      repositoryError
    );
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
  });
});
