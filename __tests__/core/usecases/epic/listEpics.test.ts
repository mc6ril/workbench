 
import { createBoardRepositoryMock } from "../../../../__mocks__/core/ports/boardRepository";
import { createEpicRepositoryMock } from "../../../../__mocks__/core/ports/epicRepository";

import type { Board, Column } from "@/modules/board/core/domain/schema/board.schema";
import type { Epic } from "@/modules/board/core/domain/schema/epic.schema";
import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import { listEpics } from "@/modules/board/core/usecases/epic/listEpics";

describe("listEpics", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockEpic1: Epic = {
    id: "223e4567-e89b-12d3-a456-426614174000",
    projectId,
    name: "Epic 1",
    description: "First epic",
    codeNumber: 1,
    startDate: null,
    targetDate: null,
    color: "#6B7280",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockEpic2: Epic = {
    id: "323e4567-e89b-12d3-a456-426614174001",
    projectId,
    name: "Epic 2",
    description: "Second epic",
    codeNumber: 2,
    startDate: null,
    targetDate: null,
    color: "#6B7280",
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  const mockTicket1: Ticket = {
    id: "423e4567-e89b-12d3-a456-426614174000",
    projectId,
    title: "Ticket 1",
    description: "First ticket",
    status: "finit",
    position: 0,
    codeNumber: 1,
    epicId: mockEpic1.id,
    parentId: null,
    sprintId: null,
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

  const mockTicket2: Ticket = {
    id: "523e4567-e89b-12d3-a456-426614174001",
    projectId,
    title: "Ticket 2",
    description: "Second ticket",
    status: "in-progress",
    position: 1,
    codeNumber: 2,
    epicId: mockEpic1.id,
    parentId: null,
    sprintId: null,
    priority: null,
    dueDate: null,
    storyPoints: null,
    createdBy: null,
    completedAt: null,
    archivedAt: null,
    archivedWeekStart: null,
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  const mockTicket3: Ticket = {
    id: "623e4567-e89b-12d3-a456-426614174002",
    projectId,
    title: "Ticket 3",
    description: "Third ticket",
    status: "finit",
    position: 2,
    codeNumber: 3,
    epicId: mockEpic1.id,
    parentId: null,
    sprintId: null,
    priority: null,
    dueDate: null,
    storyPoints: null,
    createdBy: null,
    completedAt: null,
    archivedAt: null,
    archivedWeekStart: null,
    createdAt: new Date("2024-01-03T00:00:00Z"),
    updatedAt: new Date("2024-01-03T00:00:00Z"),
  };
  const boardId = "423e4567-e89b-12d3-a456-426614174010";
  const columns: Column[] = [
    {
      id: "col-1",
      boardId,
      name: "A faire",
      status: "todo",
      state: "todo",
      position: 0,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
    {
      id: "col-2",
      boardId,
      name: "Finit",
      status: "finit",
      state: "done",
      position: 1,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
  ];

  it("should return epics with progress", async () => {
    // Arrange
    const epics: Epic[] = [mockEpic1, mockEpic2];
    const epic1Tickets: Ticket[] = [mockTicket1, mockTicket2, mockTicket3]; // 2 completed, 1 in-progress = 66%
    const epic2Tickets: Ticket[] = []; // No tickets = 0%

    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => epics),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async (epicId) => {
          if (epicId === mockEpic1.id) return epic1Tickets;
          if (epicId === mockEpic2.id) return epic2Tickets;
          return [];
        }
      ),
    });
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => ({
        id: boardId,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => columns
      ),
    });

    // Act
    const result = await listEpics(repository, boardRepository, projectId);

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
    const boardRepository = createBoardRepositoryMock();

    // Act
    const result = await listEpics(repository, boardRepository, projectId);

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
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => ({
        id: boardId,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => columns
      ),
    });

    // Act
    const result = await listEpics(repository, boardRepository, projectId);

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
      { ...mockTicket1, status: "finit" },
      { ...mockTicket2, status: "finit" },
      { ...mockTicket3, status: "finit" },
    ];
    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => epics),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => allCompletedTickets
      ),
    });
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => ({
        id: boardId,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => columns
      ),
    });

    // Act
    const result = await listEpics(repository, boardRepository, projectId);

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
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => ({
        id: boardId,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => columns
      ),
    });

    // Act
    const result = await listEpics(repository, boardRepository, projectId);

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
      { ...mockTicket1, status: "finit" },
      { ...mockTicket2, status: "todo" },
      { ...mockTicket3, status: "finit" },
    ]; // 2 completed, 1 todo = 66.67% rounded to 67%
    const repository = createEpicRepositoryMock({
      listByProject: jest.fn<Promise<Epic[]>, [string]>(async () => epics),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => mixedTickets
      ),
    });
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => ({
        id: boardId,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => columns
      ),
    });

    // Act
    const result = await listEpics(repository, boardRepository, projectId);

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
    const boardRepository = createBoardRepositoryMock();

    // Act & Assert
    await expect(
      listEpics(repository, boardRepository, projectId)
    ).rejects.toThrow(repositoryError);
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
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => ({
        id: boardId,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => columns
      ),
    });

    // Act & Assert
    await expect(
      listEpics(repository, boardRepository, projectId)
    ).rejects.toThrow(repositoryError);
    expect(repository.listByProject).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
  });
});
