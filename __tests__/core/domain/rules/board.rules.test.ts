import { buildMissingDefaultColumnCreates } from "@/modules/board/core/domain/board.defaults";
import type {
  Board,
  Column,
  CreateBoardInput,
  CreateColumnInput,
} from "@/modules/board/core/domain/board.types";
import {
  validateBoardColumnRelationship,
  validateBoardHasActiveDoneState,
  validateBoardWithColumns,
  validateColumnOrder,
} from "@/modules/board/core/domain/rules/board.rules";

describe("Board Business Rules", () => {
  const createMockColumn = (overrides?: Partial<Column>): Column => ({
    id: "column-1",
    boardId: "board-1",
    name: "To Do",
    key: "todo",
    state: "todo",
    position: 0,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockBoard = (overrides?: Partial<Board>): Board => ({
    id: "board-1",
    projectId: "project-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("validateColumnOrder", () => {
    it("should return success for empty array", () => {
      // Arrange
      const columns: Column[] = [];

      // Act
      const result = validateColumnOrder(columns);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return success for valid positions with gaps", () => {
      // Arrange
      const columns: Column[] = [
        createMockColumn({ id: "col-1", position: 0 }),
        createMockColumn({ id: "col-2", position: 2 }),
        createMockColumn({ id: "col-3", position: 5 }),
      ];

      // Act
      const result = validateColumnOrder(columns);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return success for valid sequential positions", () => {
      // Arrange
      const columns: Column[] = [
        createMockColumn({ id: "col-1", position: 0 }),
        createMockColumn({ id: "col-2", position: 1 }),
        createMockColumn({ id: "col-3", position: 2 }),
      ];

      // Act
      const result = validateColumnOrder(columns);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return error for duplicate positions within same board", () => {
      // Arrange
      const columns: Column[] = [
        createMockColumn({ id: "col-1", position: 0 }),
        createMockColumn({ id: "col-2", position: 0 }), // Duplicate
        createMockColumn({ id: "col-3", position: 1 }),
      ];

      // Act
      const result = validateColumnOrder(columns);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_COLUMN_ORDER");
        expect(result.error.field).toBe("position");
      }
    });

    it("should return success for duplicate positions in different boards", () => {
      // Arrange
      const columns: Column[] = [
        createMockColumn({ id: "col-1", boardId: "board-1", position: 0 }),
        createMockColumn({ id: "col-2", boardId: "board-2", position: 0 }), // Same position, different board
      ];

      // Act
      const result = validateColumnOrder(columns);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("validateBoardHasActiveDoneState", () => {
    it("should return success when at least one visible done column exists", () => {
      const columns: Column[] = [
        createMockColumn({ id: "col-1", state: "todo", visible: true }),
        createMockColumn({ id: "col-2", state: "done", visible: true }),
      ];

      const result = validateBoardHasActiveDoneState(columns);

      expect(result.success).toBe(true);
    });

    it("should return error when done columns are missing", () => {
      const columns: Column[] = [
        createMockColumn({ id: "col-1", state: "todo", visible: true }),
        createMockColumn({ id: "col-2", state: "in_progress", visible: true }),
      ];

      const result = validateBoardHasActiveDoneState(columns);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("MISSING_DONE_COLUMN");
        expect(result.error.field).toBe("state");
      }
    });

    it("should return error when only done columns are hidden", () => {
      const columns: Column[] = [
        createMockColumn({ id: "col-1", state: "todo", visible: true }),
        createMockColumn({ id: "col-2", state: "done", visible: false }),
      ];

      const result = validateBoardHasActiveDoneState(columns);

      expect(result.success).toBe(false);
    });
  });

  describe("validateBoardColumnRelationship", () => {
    it("should return success when column belongs to board", () => {
      // Arrange
      const column = createMockColumn({ boardId: "board-1" });
      const boardId = "board-1";

      // Act
      const result = validateBoardColumnRelationship(column, boardId);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return error when column belongs to different board", () => {
      // Arrange
      const column = createMockColumn({ boardId: "board-1" });
      const boardId = "board-2";

      // Act
      const result = validateBoardColumnRelationship(column, boardId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_BOARD_COLUMN_RELATIONSHIP");
        expect(result.error.field).toBe("boardId");
      }
    });

    it("should work with CreateColumnInput", () => {
      // Arrange
      const columnInput: CreateColumnInput = {
        boardId: "board-1",
        name: "To Do",
        key: "todo",
        state: "todo",
        position: 0,
      };
      const boardId = "board-1";

      // Act
      const result = validateBoardColumnRelationship(columnInput, boardId);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("validateBoardWithColumns", () => {
    it("should return success for empty columns array", () => {
      // Arrange
      const board = createMockBoard();
      const columns: Column[] = [];

      // Act
      const result = validateBoardWithColumns(board, columns);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return success for valid board with columns", () => {
      // Arrange
      const board = createMockBoard({ id: "board-1" });
      const columns: Column[] = [
        createMockColumn({
          id: "col-1",
          boardId: "board-1",
          position: 0,
          key: "todo",
          state: "todo",
        }),
        createMockColumn({
          id: "col-2",
          boardId: "board-1",
          position: 1,
          key: "in-progress",
          state: "in_progress",
        }),
        createMockColumn({
          id: "col-3",
          boardId: "board-1",
          position: 2,
          key: "done",
          state: "done",
        }),
      ];

      // Act
      const result = validateBoardWithColumns(board, columns);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return error when columns from multiple boards are passed", () => {
      // Arrange
      const board = createMockBoard({ id: "board-1" });
      const columns: Column[] = [
        createMockColumn({ id: "col-1", boardId: "board-1", position: 0 }),
        createMockColumn({ id: "col-2", boardId: "board-2", position: 0 }), // Different board
      ];

      // Act
      const result = validateBoardWithColumns(board, columns);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("MIXED_BOARD_COLUMNS");
      }
    });

    it("should return error for duplicate positions", () => {
      // Arrange
      const board = createMockBoard({ id: "board-1" });
      const columns: Column[] = [
        createMockColumn({ id: "col-1", boardId: "board-1", position: 0 }),
        createMockColumn({ id: "col-2", boardId: "board-1", position: 0 }), // Duplicate
      ];

      // Act
      const result = validateBoardWithColumns(board, columns);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_COLUMN_ORDER");
      }
    });

    it("should return error when there is no visible done state", () => {
      // Arrange
      const board = createMockBoard({ id: "board-1" });
      const columns: Column[] = [
        createMockColumn({
          id: "col-1",
          boardId: "board-1",
          position: 0,
          key: "todo",
          state: "todo",
        }),
        createMockColumn({
          id: "col-2",
          boardId: "board-1",
          position: 1,
          key: "in-progress",
          state: "in_progress",
        }),
      ];

      // Act
      const result = validateBoardWithColumns(board, columns);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("MISSING_DONE_COLUMN");
      }
    });

    it("should work with CreateBoardInput", () => {
      // Arrange
      const boardInput: CreateBoardInput = {
        projectId: "project-1",
      };
      const columns: Column[] = [
        createMockColumn({
          id: "col-1",
          boardId: "board-1",
          position: 0,
          key: "todo",
          state: "todo",
        }),
        createMockColumn({
          id: "col-2",
          boardId: "board-1",
          position: 1,
          key: "completed",
          state: "done",
        }),
      ];

      // Act
      const result = validateBoardWithColumns(boardInput, columns);

      // Assert
      // Should use first column's boardId for validation
      expect(result.success).toBe(true);
    });
  });

  describe("buildMissingDefaultColumnCreates", () => {
    it("returns all three defaults when the board has no columns", () => {
      const creates = buildMissingDefaultColumnCreates([]);

      expect(creates).toHaveLength(3);
      expect(creates.map((c) => c.state)).toEqual([
        "todo",
        "in_progress",
        "done",
      ]);
      expect(creates.map((c) => c.position)).toEqual([0, 1, 2]);
    });

    it("returns no creates when each workflow state already exists", () => {
      const columns: Column[] = [
        createMockColumn({ id: "a", state: "todo", position: 0 }),
        createMockColumn({ id: "b", state: "in_progress", position: 1 }),
        createMockColumn({ id: "c", state: "done", position: 2 }),
      ];

      expect(buildMissingDefaultColumnCreates(columns)).toHaveLength(0);
    });

    it("creates only absent states and skips duplicate state coverage", () => {
      const columns: Column[] = [
        createMockColumn({ id: "a", state: "todo", position: 0 }),
        createMockColumn({
          id: "b",
          state: "todo",
          position: 3,
          name: "Backlog",
        }),
      ];

      const creates = buildMissingDefaultColumnCreates(columns);

      expect(creates).toHaveLength(2);
      expect(creates.map((c) => c.state)).toEqual(["in_progress", "done"]);
      expect(creates[0].position).toBe(1);
      expect(creates[1].position).toBe(2);
    });

    it("avoids position collisions with existing columns", () => {
      const columns: Column[] = [
        createMockColumn({ id: "a", state: "todo", position: 0 }),
        createMockColumn({ id: "b", state: "in_progress", position: 1 }),
        createMockColumn({
          id: "c",
          state: "in_progress",
          position: 2,
          name: "Review",
        }),
      ];

      const creates = buildMissingDefaultColumnCreates(columns);

      expect(creates).toHaveLength(1);
      expect(creates[0].state).toBe("done");
      expect(creates[0].position).toBe(3);
    });
  });
});
