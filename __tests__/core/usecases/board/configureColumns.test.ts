import { z } from "zod";

import { createBoardRepositoryMock } from "../../../../__mocks__/core/ports/boardRepository";

import type {
  Board,
  Column,
  ConfigureColumnsInput,
  CreateColumnInput,
  UpdateColumnInput,
} from "@/modules/board/core/domain/schema/board.schema";
import { configureColumns } from "@/modules/board/core/usecases/board/configuration/configureColumns";

describe("configureColumns", () => {
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
    name: "Done",
    key: "completed",
    state: "done",
    position: 1,
    visible: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  it("should configure columns for existing board (update existing, create new)", async () => {
    // Arrange
    const input: ConfigureColumnsInput = {
      projectId,
      columns: [
        {
          id: mockColumn1.id,
          name: "Updated Todo",
          key: "todo",
          state: "todo",
          position: 0,
          visible: true,
        },
        {
          name: "New Column",
          key: "new-status",
          state: "done",
          position: 2,
          visible: true,
        },
      ],
    };
    const updatedColumn1 = {
      ...mockColumn1,
      name: "Updated Todo",
    };
    const newColumn: Column = {
      id: "523e4567-e89b-12d3-a456-426614174002",
      boardId,
      name: "New Column",
      key: "new-status",
      state: "done",
      position: 2,
      visible: true,
      createdAt: new Date("2024-01-02T00:00:00Z"),
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    };
    const existingColumns = [mockColumn1, mockColumn2];
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => existingColumns
      ),
      updateColumn: jest.fn<Promise<Column>, [string, UpdateColumnInput]>(
        async () => updatedColumn1
      ),
      createColumn: jest.fn<Promise<Column>, [CreateColumnInput]>(
        async () => newColumn
      ),
      deleteColumn: jest.fn<Promise<void>, [string]>(async () => undefined),
    });
    // Mock final columns after updates
    repository.listColumnsByBoard.mockResolvedValueOnce(existingColumns);
    repository.listColumnsByBoard.mockResolvedValueOnce([
      updatedColumn1,
      newColumn,
    ]);

    // Act
    const result = await configureColumns(repository, input);

    // Assert
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.findByProject).toHaveBeenCalledWith(projectId);
    expect(repository.listColumnsByBoard).toHaveBeenCalledTimes(2);
    expect(repository.updateColumn).toHaveBeenCalledTimes(1);
    expect(repository.updateColumn).toHaveBeenCalledWith(mockColumn1.id, {
      name: "Updated Todo",
      key: "todo",
      state: "todo",
      position: 0,
      visible: true,
    });
    expect(repository.createColumn).toHaveBeenCalledTimes(1);
    expect(repository.createColumn).toHaveBeenCalledWith({
      boardId,
      name: "New Column",
      key: "new-status",
      state: "done",
      position: 2,
      visible: true,
    });
    expect(repository.deleteColumn).toHaveBeenCalledTimes(1);
    expect(repository.deleteColumn).toHaveBeenCalledWith(mockColumn2.id);
    expect(result.board).toEqual(mockBoard);
    expect(result.columns).toHaveLength(2);
    expect(result.columns[0].name).toBe("Updated Todo");
    expect(result.columns[1].name).toBe("New Column");
  });

  it("should configure columns for new board (create board + columns)", async () => {
    // Arrange
    const input: ConfigureColumnsInput = {
      projectId,
      columns: [
        {
          name: "Todo",
          key: "todo",
          state: "todo",
          position: 0,
          visible: true,
        },
        {
          name: "Done",
          key: "completed",
          state: "done",
          position: 1,
          visible: true,
        },
      ],
    };
    const newColumn1: Column = {
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
    const newColumn2: Column = {
      id: "423e4567-e89b-12d3-a456-426614174001",
      boardId,
      name: "Done",
      key: "completed",
      state: "done",
      position: 1,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => null),
      create: jest.fn<Promise<Board>, [{ projectId: string }]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => []),
      createColumn: jest.fn<Promise<Column>, [CreateColumnInput]>(
        async (input) => {
          if (input.name === "Todo") return newColumn1;
          return newColumn2;
        }
      ),
    });
    repository.listColumnsByBoard.mockResolvedValueOnce([]);
    repository.listColumnsByBoard.mockResolvedValueOnce([
      newColumn1,
      newColumn2,
    ]);

    // Act
    const result = await configureColumns(repository, input);

    // Assert
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ projectId });
    expect(repository.listColumnsByBoard).toHaveBeenCalledTimes(2);
    expect(repository.createColumn).toHaveBeenCalledTimes(2);
    expect(repository.deleteColumn).not.toHaveBeenCalled();
    expect(result.board).toEqual(mockBoard);
    expect(result.columns).toHaveLength(2);
  });

  it("should be idempotent: reapplying same configuration doesn't create duplicates", async () => {
    // Arrange
    const input: ConfigureColumnsInput = {
      projectId,
      columns: [
        {
          id: mockColumn1.id,
          name: mockColumn1.name,
          key: mockColumn1.key,
          state: mockColumn1.state,
          position: mockColumn1.position,
          visible: mockColumn1.visible,
        },
        {
          id: mockColumn2.id,
          name: mockColumn2.name,
          key: mockColumn2.key,
          state: mockColumn2.state,
          position: mockColumn2.position,
          visible: mockColumn2.visible,
        },
      ],
    };
    const existingColumns = [mockColumn1, mockColumn2];
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(
        async () => existingColumns
      ),
      updateColumn: jest.fn<Promise<Column>, [string, UpdateColumnInput]>(
        async (id) => {
          if (id === mockColumn1.id) return mockColumn1;
          return mockColumn2;
        }
      ),
    });
    repository.listColumnsByBoard.mockResolvedValueOnce(existingColumns);
    repository.listColumnsByBoard.mockResolvedValueOnce(existingColumns);

    // Act
    const result = await configureColumns(repository, input);

    // Assert
    expect(repository.updateColumn).toHaveBeenCalledTimes(2);
    expect(repository.createColumn).not.toHaveBeenCalled();
    expect(repository.deleteColumn).not.toHaveBeenCalled();
    expect(result.columns).toHaveLength(2);
    expect(result.columns).toEqual(existingColumns);
  });

  it("should throw ZodError on invalid input (empty columns array)", async () => {
    // Arrange
    const input = {
      projectId,
      columns: [],
    } as unknown as ConfigureColumnsInput;
    const repository = createBoardRepositoryMock();

    // Act & Assert
    await expect(configureColumns(repository, input)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.findByProject).not.toHaveBeenCalled();
  });

  it("should throw DomainRuleError when no terminal done column is active", async () => {
    // Arrange
    const input: ConfigureColumnsInput = {
      projectId,
      columns: [
        {
          name: "Todo 1",
          key: "todo",
          state: "todo",
          position: 0,
          visible: true,
        },
        {
          name: "Todo 2",
          key: "todo-2",
          state: "in_progress",
          position: 1,
          visible: true,
        },
      ],
    };
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => []),
      createColumn: jest.fn<Promise<Column>, [CreateColumnInput]>(
        async (input) => ({
          id: "new-id",
          boardId,
          name: input.name,
          key: input.key,
          state: input.state,
          position: input.position,
          visible: input.visible ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ),
    });
    // Mock final columns without any done state
    repository.listColumnsByBoard.mockResolvedValueOnce([]);
    repository.listColumnsByBoard.mockResolvedValueOnce([
      {
        id: "1",
        boardId,
        name: "Todo 1",
        key: "todo",
        state: "todo",
        position: 0,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        boardId,
        name: "Todo 2",
        key: "todo-2",
        state: "in_progress",
        position: 1,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Act & Assert
    await expect(configureColumns(repository, input)).rejects.toMatchObject({
      code: "MISSING_DONE_COLUMN",
    });
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.createColumn).not.toHaveBeenCalled();
  });

  it("should throw DomainRuleError on duplicate positions", async () => {
    // Arrange
    const input: ConfigureColumnsInput = {
      projectId,
      columns: [
        {
          name: "Column 1",
          key: "status1",
          state: "todo",
          position: 0,
          visible: true,
        },
        {
          name: "Column 2",
          key: "status2",
          state: "done",
          position: 0,
          visible: true,
        },
      ],
    };
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => []),
      createColumn: jest.fn<Promise<Column>, [CreateColumnInput]>(
        async (input) => ({
          id: "new-id",
          boardId,
          name: input.name,
          key: input.key,
          state: input.state,
          position: input.position,
          visible: input.visible ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ),
    });
    // Mock final columns with duplicate positions
    repository.listColumnsByBoard.mockResolvedValueOnce([]);
    repository.listColumnsByBoard.mockResolvedValueOnce([
      {
        id: "1",
        boardId,
        name: "Column 1",
        key: "status1",
        state: "todo",
        position: 0,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        boardId,
        name: "Column 2",
        key: "status2",
        state: "done",
        position: 0,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Act & Assert
    await expect(configureColumns(repository, input)).rejects.toMatchObject({
      code: "INVALID_COLUMN_ORDER",
    });
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
    expect(repository.createColumn).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const input: ConfigureColumnsInput = {
      projectId,
      columns: [
        {
          name: "Todo",
          key: "todo",
          state: "done",
          position: 0,
          visible: true,
        },
      ],
    };
    const repositoryError = new Error("Database error");
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(configureColumns(repository, input)).rejects.toThrow(
      repositoryError
    );
    expect(repository.findByProject).toHaveBeenCalledTimes(1);
  });

  it("should use temporary keys before swapping existing column keys", async () => {
    const swapColumn1: Column = {
      ...mockColumn1,
      key: "alpha",
    };
    const swapColumn2: Column = {
      ...mockColumn2,
      key: "omega",
    };
    const input: ConfigureColumnsInput = {
      projectId,
      columns: [
        {
          id: swapColumn1.id,
          name: swapColumn1.name,
          key: "omega",
          state: swapColumn1.state,
          position: swapColumn1.position,
          visible: swapColumn1.visible,
        },
        {
          id: swapColumn2.id,
          name: swapColumn2.name,
          key: "alpha",
          state: swapColumn2.state,
          position: swapColumn2.position,
          visible: swapColumn2.visible,
        },
      ],
    };
    const repository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(
        async () => mockBoard
      ),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => [
        swapColumn1,
        swapColumn2,
      ]),
      updateColumn: jest.fn<Promise<Column>, [string, UpdateColumnInput]>(
        async (id, update) => ({
          ...(id === swapColumn1.id ? swapColumn1 : swapColumn2),
          ...update,
          visible:
            update.visible ??
            (id === swapColumn1.id ? swapColumn1.visible : swapColumn2.visible),
          state:
            update.state ??
            (id === swapColumn1.id ? swapColumn1.state : swapColumn2.state),
          position:
            update.position ??
            (id === swapColumn1.id
              ? swapColumn1.position
              : swapColumn2.position),
        })
      ),
    });
    repository.listColumnsByBoard.mockResolvedValueOnce([
      swapColumn1,
      swapColumn2,
    ]);
    repository.listColumnsByBoard.mockResolvedValueOnce([
      {
        ...swapColumn1,
        key: "omega",
      },
      {
        ...swapColumn2,
        key: "alpha",
      },
    ]);

    await configureColumns(repository, input);

    expect(repository.updateColumn).toHaveBeenNthCalledWith(1, swapColumn1.id, {
      key: `__tmp__column-config__${swapColumn1.id}`,
    });
    expect(repository.updateColumn).toHaveBeenNthCalledWith(2, swapColumn2.id, {
      key: `__tmp__column-config__${swapColumn2.id}`,
    });
    expect(repository.updateColumn).toHaveBeenCalledWith(swapColumn1.id, {
      name: swapColumn1.name,
      key: "omega",
      state: swapColumn1.state,
      position: swapColumn1.position,
      visible: swapColumn1.visible,
    });
    expect(repository.updateColumn).toHaveBeenCalledWith(swapColumn2.id, {
      name: swapColumn2.name,
      key: "alpha",
      state: swapColumn2.state,
      position: swapColumn2.position,
      visible: swapColumn2.visible,
    });
  });
});
