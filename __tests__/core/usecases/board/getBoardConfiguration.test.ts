import { createBoardRepositoryMock } from "../../../../__mocks__/core/ports/boardRepository";

import { DEFAULT_COLUMN_KEY_BY_STATE } from "@/modules/board/core/domain/board.defaults";
import type {
  Board,
  BoardConfiguration,
  Column,
  CreateColumnInput,
} from "@/modules/board/core/domain/board.types";
import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";

describe("getBoardConfiguration", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";
  const boardId = "223e4567-e89b-12d3-a456-426614174000";

  const mockBoard: Board = {
    id: boardId,
    projectId,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockColumn1: Column = {
    id: "323e4567-e89b-12d3-a456-426614174000",
    boardId,
    name: "Todo",
    key: "todo",
    state: "todo",
    position: 0,
    visible: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockColumn2: Column = {
    id: "423e4567-e89b-12d3-a456-426614174001",
    boardId,
    name: "In Progress",
    key: "in-progress",
    state: "in_progress",
    position: 1,
    visible: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockColumn3: Column = {
    id: "523e4567-e89b-12d3-a456-426614174002",
    boardId,
    name: "Done",
    key: "completed",
    state: "done",
    position: 2,
    visible: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  it("should return existing board configuration when all default workflow states exist", async () => {
    const existingColumns = [mockColumn1, mockColumn2, mockColumn3];
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => existingColumns
      ),
    });

    const result = await getBoardConfiguration(repository, projectId);

    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.findByProject).toHaveBeenCalledWith(projectId);
    expect(repository.listColumnsByBoard).toHaveBeenCalledTimes(1);
    expect(repository.listColumnsByBoard).toHaveBeenCalledWith(boardId);
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.createColumn).not.toHaveBeenCalled();
    expect(result).toMatchObject<BoardConfiguration>({
      board: mockBoard,
      columns: existingColumns,
    });
    expect(result.columns).toHaveLength(3);
  });

  it("should create only missing default columns when some workflow states already exist", async () => {
    const existingColumns = [mockColumn1, mockColumn2];
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => existingColumns
      ),
      createColumn: jest.fn<Promise<Column>, [CreateColumnInput]>(
        async (input) => {
          expect(input.state).toBe("done");
          return mockColumn3;
        }
      ),
    });

    const result = await getBoardConfiguration(repository, projectId);

    expect(repository.listColumnsByBoard).toHaveBeenCalledTimes(1);
    expect(repository.createColumn).toHaveBeenCalledTimes(1);
    expect(repository.createColumn).toHaveBeenCalledWith({
      boardId,
      name: "Done",
      key: DEFAULT_COLUMN_KEY_BY_STATE.done,
      state: "done",
      position: 2,
      visible: true,
    });
    expect(result.columns).toHaveLength(3);
  });

  it("should return default configuration when no board exists (auto-create board + columns)", async () => {
    // Arrange
    const defaultColumn1: Column = {
      id: "323e4567-e89b-12d3-a456-426614174000",
      boardId,
      name: "Todo",
      key: "todo",
      state: "todo",
      position: 0,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const defaultColumn2: Column = {
      id: "423e4567-e89b-12d3-a456-426614174001",
      boardId,
      name: "In Progress",
      key: DEFAULT_COLUMN_KEY_BY_STATE.in_progress,
      state: "in_progress",
      position: 1,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const defaultColumn3: Column = {
      id: "523e4567-e89b-12d3-a456-426614174002",
      boardId,
      name: "Done",
      key: DEFAULT_COLUMN_KEY_BY_STATE.done,
      state: "done",
      position: 2,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const defaultColumns = [defaultColumn1, defaultColumn2, defaultColumn3];
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => null),
      create: jest.fn<Promise<Board>, [{ projectId: string }]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => []),
      createColumn: jest.fn<Promise<Column>, [CreateColumnInput]>(
        async (input) => {
          if (input.name === "Todo") return defaultColumn1;
          if (input.name === "In Progress") return defaultColumn2;
          return defaultColumn3;
        }
      ),
    });

    // Act
    const result = await getBoardConfiguration(repository, projectId);

    // Assert
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.findByProject).toHaveBeenCalledWith(projectId);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ projectId });
    expect(repository.listColumnsByBoard).toHaveBeenCalledTimes(1);
    expect(repository.listColumnsByBoard).toHaveBeenCalledWith(boardId);
    expect(repository.createColumn).toHaveBeenCalledTimes(3);
    expect(result).toMatchObject<BoardConfiguration>({
      board: mockBoard,
      columns: defaultColumns,
    });
    expect(result.columns).toHaveLength(3);
    expect(result.columns[0].name).toBe("Todo");
    expect(result.columns[1].name).toBe("In Progress");
    expect(result.columns[2].name).toBe("Done");
  });

  it("should create default columns when board exists but no columns", async () => {
    // Arrange
    const defaultColumn1: Column = {
      id: "323e4567-e89b-12d3-a456-426614174000",
      boardId,
      name: "Todo",
      key: "todo",
      state: "todo",
      position: 0,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const defaultColumn2: Column = {
      id: "423e4567-e89b-12d3-a456-426614174001",
      boardId,
      name: "In Progress",
      key: DEFAULT_COLUMN_KEY_BY_STATE.in_progress,
      state: "in_progress",
      position: 1,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const defaultColumn3: Column = {
      id: "523e4567-e89b-12d3-a456-426614174002",
      boardId,
      name: "Done",
      key: DEFAULT_COLUMN_KEY_BY_STATE.done,
      state: "done",
      position: 2,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const defaultColumns = [defaultColumn1, defaultColumn2, defaultColumn3];
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => []),
      createColumn: jest.fn<Promise<Column>, [CreateColumnInput]>(
        async (input) => {
          if (input.name === "Todo") return defaultColumn1;
          if (input.name === "In Progress") return defaultColumn2;
          return defaultColumn3;
        }
      ),
    });

    // Act
    const result = await getBoardConfiguration(repository, projectId);

    // Assert
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.listColumnsByBoard).toHaveBeenCalledTimes(1);
    expect(repository.listColumnsByBoard).toHaveBeenCalledWith(boardId);
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.createColumn).toHaveBeenCalledTimes(3);
    expect(result).toMatchObject<BoardConfiguration>({
      board: mockBoard,
      columns: defaultColumns,
    });
    expect(result.columns).toHaveLength(3);
  });

  it("should propagate repository errors from findByProject", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(getBoardConfiguration(repository, projectId)).rejects.toThrow(
      repositoryError
    );
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.listColumnsByBoard).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from create", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => null),
      create: jest.fn<Promise<Board>, [{ projectId: string }]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(getBoardConfiguration(repository, projectId)).rejects.toThrow(
      repositoryError
    );
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.listColumnsByBoard).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from listColumnsByBoard", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(getBoardConfiguration(repository, projectId)).rejects.toThrow(
      repositoryError
    );
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.listColumnsByBoard).toHaveBeenCalledTimes(1);
  });
});
