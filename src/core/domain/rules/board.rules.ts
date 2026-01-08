import type {
  Board,
  Column,
  CreateBoardInput,
  CreateColumnInput,
} from "@/core/domain/schema/board.schema";

/**
 * Validation result type for business rules.
 * Returns success or error with code and message.
 */
type ValidationResult =
  | { success: true }
  | { success: false; error: ValidationError };

type ValidationError = {
  code: string;
  message: string;
  field?: string;
};

/**
 * Validates column positions within a board.
 * Ensures no duplicate positions within the same board.
 * Allows gaps in sequence (e.g., 0, 2, 5 is valid).
 *
 * @param columns - Array of columns to validate
 * @returns Validation result
 */
export const validateColumnOrder = (columns: Column[]): ValidationResult => {
  if (columns.length === 0) {
    return { success: true };
  }

  // Group columns by boardId to validate per board
  const columnsByBoard = new Map<string, Column[]>();
  for (const column of columns) {
    const boardColumns = columnsByBoard.get(column.boardId) || [];
    boardColumns.push(column);
    columnsByBoard.set(column.boardId, boardColumns);
  }

  // Validate each board's columns
  for (const [boardId, boardColumns] of Array.from(columnsByBoard.entries())) {
    const positions = boardColumns.map((col) => col.position);
    const positionSet = new Set(positions);

    // Check for duplicates
    if (positions.length !== positionSet.size) {
      const duplicates = positions.filter(
        (pos, index) => positions.indexOf(pos) !== index
      );
      return {
        success: false,
        error: {
          code: "INVALID_COLUMN_ORDER",
          message: `Duplicate column positions found in board ${boardId}: ${duplicates.join(", ")}`,
          field: "position",
        },
      };
    }
  }

  return { success: true };
};

/**
 * Validates that column statuses are unique within each board.
 * Ensures no two columns in the same board have the same status.
 *
 * @param columns - Array of columns to validate
 * @returns Validation result
 */
export const validateColumnStatusUniqueness = (
  columns: Column[]
): ValidationResult => {
  if (columns.length === 0) {
    return { success: true };
  }

  // Group columns by boardId to validate per board
  const columnsByBoard = new Map<string, Column[]>();
  for (const column of columns) {
    const boardColumns = columnsByBoard.get(column.boardId) || [];
    boardColumns.push(column);
    columnsByBoard.set(column.boardId, boardColumns);
  }

  // Validate each board's columns
  for (const [boardId, boardColumns] of Array.from(columnsByBoard.entries())) {
    const statuses = boardColumns.map((col) => col.status);
    const statusSet = new Set(statuses);

    // Check for duplicates
    if (statuses.length !== statusSet.size) {
      const duplicates = statuses.filter(
        (status, index) => statuses.indexOf(status) !== index
      );
      return {
        success: false,
        error: {
          code: "DUPLICATE_COLUMN_STATUS",
          message: `Duplicate column statuses found in board ${boardId}: ${duplicates.join(", ")}`,
          field: "status",
        },
      };
    }
  }

  return { success: true };
};

/**
 * Validates that a column belongs to the specified board.
 * Ensures column.boardId matches the provided boardId.
 *
 * @param column - Column to validate (can be Column or CreateColumnInput)
 * @param boardId - Expected board ID
 * @returns Validation result
 */
export const validateBoardColumnRelationship = (
  column: Column | CreateColumnInput,
  boardId: string
): ValidationResult => {
  if (column.boardId !== boardId) {
    return {
      success: false,
      error: {
        code: "INVALID_BOARD_COLUMN_RELATIONSHIP",
        message: `Column belongs to board ${column.boardId}, but expected board ${boardId}`,
        field: "boardId",
      },
    };
  }

  return { success: true };
};

/**
 * Validates a board with all its columns.
 * Combines board validation, column ordering, status uniqueness, and relationships.
 * Filters columns by board.id (or first column's boardId for CreateBoardInput) to ensure all columns belong to the same board.
 *
 * @param board - Board to validate (can be Board or CreateBoardInput)
 * @param columns - Array of columns belonging to the board
 * @returns Validation result
 */
export const validateBoardWithColumns = (
  board: Board | CreateBoardInput,
  columns: Column[]
): ValidationResult => {
  if (columns.length === 0) {
    return { success: true };
  }

  // Get board ID: use board.id if available, otherwise use first column's boardId
  const boardId = "id" in board ? board.id : columns[0]?.boardId;

  if (!boardId) {
    return {
      success: false,
      error: {
        code: "MIXED_BOARD_COLUMNS",
        message: "Cannot determine board ID for validation",
      },
    };
  }

  // Filter columns by boardId to ensure all columns belong to this board
  const boardColumns = columns.filter((col) => col.boardId === boardId);

  // Check if columns from multiple boards were passed
  if (boardColumns.length !== columns.length) {
    const otherBoardIds = Array.from(
      new Set(
        columns
          .filter((col) => col.boardId !== boardId)
          .map((col) => col.boardId)
      )
    );
    return {
      success: false,
      error: {
        code: "MIXED_BOARD_COLUMNS",
        message: `Columns from multiple boards passed: board ${boardId} and boards ${otherBoardIds.join(", ")}`,
      },
    };
  }

  // Validate column ordering
  const orderResult = validateColumnOrder(boardColumns);
  if (!orderResult.success) {
    return orderResult;
  }

  // Validate status uniqueness
  const uniquenessResult = validateColumnStatusUniqueness(boardColumns);
  if (!uniquenessResult.success) {
    return uniquenessResult;
  }

  // Validate all columns belong to this board
  for (const column of boardColumns) {
    const relationshipResult = validateBoardColumnRelationship(column, boardId);
    if (!relationshipResult.success) {
      return relationshipResult;
    }
  }

  return { success: true };
};
