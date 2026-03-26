 
import { createBoardRepositoryMock } from "../../../../__mocks__/core/ports/boardRepository";
import { createEpicRepositoryMock } from "../../../../__mocks__/core/ports/epicRepository";

import type { Board, Column } from "@/modules/board/core/domain/schema/board.schema";
import type { Epic } from "@/modules/board/core/domain/schema/epic.schema";
import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import { getEpicDetail } from "@/modules/board/core/usecases/epic/getEpicDetail";

describe("getEpicDetail", () => {
  const epicId = "123e4567-e89b-12d3-a456-426614174000";
  const projectId = "223e4567-e89b-12d3-a456-426614174000";

  const mockEpic: Epic = {
    id: epicId,
    projectId,
    name: "Test Epic",
    description: "Test description",
    codeNumber: 1,
    startDate: null,
    targetDate: null,
    color: "#6B7280",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockTicket1: Ticket = {
    id: "323e4567-e89b-12d3-a456-426614174000",
    projectId,
    title: "Ticket 1",
    description: "First ticket",
    status: "finit",
    position: 0,
    codeNumber: 1,
    epicId,
    parentId: null,
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
    id: "423e4567-e89b-12d3-a456-426614174001",
    projectId,
    title: "Ticket 2",
    description: "Second ticket",
    status: "in-progress",
    position: 1,
    codeNumber: 2,
    epicId,
    parentId: null,
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
    id: "523e4567-e89b-12d3-a456-426614174002",
    projectId,
    title: "Ticket 3",
    description: "Third ticket",
    status: "finit",
    position: 2,
    codeNumber: 3,
    epicId,
    parentId: null,
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
  const boardId = "523e4567-e89b-12d3-a456-426614174010";
  const columns: Column[] = [
    {
      id: "col-1",
      boardId,
      name: "A faire",
      status: "todo",
      state: "todo",
      position: 0,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "col-2",
      boardId,
      name: "Finit",
      status: "finit",
      state: "done",
      position: 1,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("should return epic detail with progress and tickets", async () => {
    // Arrange
    const tickets: Ticket[] = [mockTicket1, mockTicket2, mockTicket3]; // 2 completed, 1 in-progress = 67%
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => mockEpic),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => tickets
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
    const result = await getEpicDetail(repository, boardRepository, epicId);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(epicId);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledWith(epicId);
    expect(result).toMatchObject({
      ...mockEpic,
      progress: 67, // 2/3 = 66.67% rounded to 67%
      tickets: [
        {
          id: mockTicket1.id,
          title: mockTicket1.title,
          status: mockTicket1.status,
        },
        {
          id: mockTicket2.id,
          title: mockTicket2.title,
          status: mockTicket2.status,
        },
        {
          id: mockTicket3.id,
          title: mockTicket3.title,
          status: mockTicket3.status,
        },
      ],
    });
    // Verify tickets contain only minimal info (id, title, status)
    expect(result.tickets[0]).not.toHaveProperty("description");
    expect(result.tickets[0]).not.toHaveProperty("position");
    expect(result.tickets[0]).not.toHaveProperty("projectId");
  });

  it("should return epic detail with 0% progress when no tickets", async () => {
    // Arrange
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => mockEpic),
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
    const result = await getEpicDetail(repository, boardRepository, epicId);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ...mockEpic,
      progress: 0,
      tickets: [],
    });
    expect(result.tickets).toHaveLength(0);
  });

  it("should return epic detail with 100% progress when all tickets completed", async () => {
    // Arrange
    const allCompletedTickets: Ticket[] = [
      { ...mockTicket1, status: "finit" },
      { ...mockTicket2, status: "finit" },
      { ...mockTicket3, status: "finit" },
    ];
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => mockEpic),
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
    const result = await getEpicDetail(repository, boardRepository, epicId);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ...mockEpic,
      progress: 100, // 3/3 = 100%
      tickets: [
        { id: mockTicket1.id, title: mockTicket1.title, status: "finit" },
        { id: mockTicket2.id, title: mockTicket2.title, status: "finit" },
        { id: mockTicket3.id, title: mockTicket3.title, status: "finit" },
      ],
    });
  });

  it("should return epic detail with 0% progress when no tickets completed", async () => {
    // Arrange
    const noCompletedTickets: Ticket[] = [
      { ...mockTicket1, status: "todo" },
      { ...mockTicket2, status: "in-progress" },
    ];
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => mockEpic),
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
    const result = await getEpicDetail(repository, boardRepository, epicId);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ...mockEpic,
      progress: 0, // 0/2 = 0%
      tickets: [
        { id: mockTicket1.id, title: mockTicket1.title, status: "todo" },
        { id: mockTicket2.id, title: mockTicket2.title, status: "in-progress" },
      ],
    });
  });

  it("should return 0% progress when board is missing", async () => {
    const tickets: Ticket[] = [
      { ...mockTicket1, status: "finit" },
      { ...mockTicket2, status: "finit" },
    ];
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => mockEpic),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => tickets
      ),
    });
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => null),
    });

    const result = await getEpicDetail(repository, boardRepository, epicId);

    expect(result.progress).toBe(0);
    expect(boardRepository.listColumnsByBoard).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when epic not found", async () => {
    // Arrange
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => null),
    });
    const boardRepository = createBoardRepositoryMock();

    // Act & Assert
    await expect(
      getEpicDetail(repository, boardRepository, epicId)
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      entityType: "Epic",
      entityId: epicId,
    });
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(epicId);
    expect(repository.listTicketsByEpic).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from findById", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => {
        throw repositoryError;
      }),
    });
    const boardRepository = createBoardRepositoryMock();

    // Act & Assert
    await expect(
      getEpicDetail(repository, boardRepository, epicId)
    ).rejects.toThrow(repositoryError);
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from listTicketsByEpic", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => mockEpic),
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
      getEpicDetail(repository, boardRepository, epicId)
    ).rejects.toThrow(repositoryError);
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.listTicketsByEpic).toHaveBeenCalledTimes(1);
  });

  it("should map tickets to minimal ticket info only", async () => {
    // Arrange
    const tickets: Ticket[] = [mockTicket1];
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => mockEpic),
      listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(
        async () => tickets
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
    const result = await getEpicDetail(repository, boardRepository, epicId);

    // Assert
    expect(result.tickets).toHaveLength(1);
    expect(result.tickets[0]).toEqual({
      id: mockTicket1.id,
      title: mockTicket1.title,
      status: mockTicket1.status,
    });
    // Verify tickets don't contain other fields
    expect(result.tickets[0]).not.toHaveProperty("description");
    expect(result.tickets[0]).not.toHaveProperty("position");
    expect(result.tickets[0]).not.toHaveProperty("projectId");
    expect(result.tickets[0]).not.toHaveProperty("epicId");
    expect(result.tickets[0]).not.toHaveProperty("parentId");
    expect(result.tickets[0]).not.toHaveProperty("createdAt");
    expect(result.tickets[0]).not.toHaveProperty("updatedAt");
  });
});
