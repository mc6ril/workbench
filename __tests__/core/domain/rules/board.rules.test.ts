import {
  validateBoardColumnRelationship,
  validateBoardWithColumns,
  validateColumnOrder,
  validateColumnStatusUniqueness,
} from "@/core/domain/rules/board.rules";
import type {
  Board,
  Column,
  CreateBoardInput,
  CreateColumnInput,
} from "@/core/domain/schema/board.schema";

describe("Board Business Rules", () => {
  const createMockColumn = (overrides?: Partial<Column>): Column => ({
    id: "column-1",
    boardId: "board-1",
    name: "To Do",
    status: "todo",
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

  describe("validateColumnStatusUniqueness", () => {
    it("should return success for empty array", () => {
      // Arrange
      const columns: Column[] = [];

      // Act
      const result = validateColumnStatusUniqueness(columns);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return success for unique statuses within same board", () => {
      // Arrange
      const columns: Column[] = [
        createMockColumn({ id: "col-1", status: "todo" }),
        createMockColumn({ id: "col-2", status: "in-progress" }),
        createMockColumn({ id: "col-3", status: "done" }),
      ];

      // Act
      const result = validateColumnStatusUniqueness(columns);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should return error for duplicate statuses within same board", () => {
      // Arrange
      const columns: Column[] = [
        createMockColumn({ id: "col-1", status: "todo" }),
        createMockColumn({ id: "col-2", status: "todo" }), // Duplicate
        createMockColumn({ id: "col-3", status: "done" }),
      ];

      // Act
      const result = validateColumnStatusUniqueness(columns);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DUPLICATE_COLUMN_STATUS");
        expect(result.error.field).toBe("status");
      }
    });

    it("should return success for same status in different boards", () => {
      // Arrange
      const columns: Column[] = [
        createMockColumn({ id: "col-1", boardId: "board-1", status: "todo" }),
        createMockColumn({ id: "col-2", boardId: "board-2", status: "todo" }), // Same status, different board
      ];

      // Act
      const result = validateColumnStatusUniqueness(columns);

      // Assert
      expect(result.success).toBe(true);
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
        status: "todo",
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
          status: "todo",
        }),
        createMockColumn({
          id: "col-2",
          boardId: "board-1",
          position: 1,
          status: "in-progress",
        }),
        createMockColumn({
          id: "col-3",
          boardId: "board-1",
          position: 2,
          status: "done",
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

    it("should return error for duplicate statuses", () => {
      // Arrange
      const board = createMockBoard({ id: "board-1" });
      const columns: Column[] = [
        createMockColumn({
          id: "col-1",
          boardId: "board-1",
          position: 0,
          status: "todo",
        }),
        createMockColumn({
          id: "col-2",
          boardId: "board-1",
          position: 1,
          status: "todo",
        }), // Duplicate status, different position
      ];

      // Act
      const result = validateBoardWithColumns(board, columns);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DUPLICATE_COLUMN_STATUS");
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
          status: "todo",
        }),
      ];

      // Act
      const result = validateBoardWithColumns(boardInput, columns);

      // Assert
      // Should use first column's boardId for validation
      expect(result.success).toBe(true);
    });
  });
});
