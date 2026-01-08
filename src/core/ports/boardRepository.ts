import type {
  Board,
  Column,
  CreateBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
} from "@/core/domain/schema/board.schema";

/**
 * Repository contract for Board and Column operations.
 * Hides infrastructure details and exposes domain-shaped operations.
 */
export type BoardRepository = {
  /**
   * Get a board by ID.
   * @param id - Board ID
   * @returns Board or null if not found
   * @throws DatabaseError if database operation fails
   */
  findById(id: string): Promise<Board | null>;

  /**
   * Get the board for a project.
   * Projects have a 1:1 relationship with boards.
   * @param projectId - Project ID
   * @returns Board or null if not found
   * @throws DatabaseError if database operation fails
   */
  findByProject(projectId: string): Promise<Board | null>;

  /**
   * Create a new board.
   * @param input - Board creation data
   * @returns Created board
   * @throws ConstraintError if constraint violation occurs (e.g., board already exists for project)
   * @throws DatabaseError if database operation fails
   */
  create(input: CreateBoardInput): Promise<Board>;

  /**
   * Delete a board by ID.
   * All columns belonging to this board will be deleted (cascade behavior).
   * @param id - Board ID
   * @throws NotFoundError if board not found
   * @throws DatabaseError if database operation fails
   */
  delete(id: string): Promise<void>;

  /**
   * List all columns for a board, ordered by position.
   * @param boardId - Board ID
   * @returns Array of columns ordered by position (ascending)
   * @throws DatabaseError if database operation fails
   */
  listColumnsByBoard(boardId: string): Promise<Column[]>;

  /**
   * Get a column by ID.
   * @param id - Column ID
   * @returns Column or null if not found
   * @throws DatabaseError if database operation fails
   */
  findColumnById(id: string): Promise<Column | null>;

  /**
   * Create a new column.
   * Note: Business rules should validate column ordering and status uniqueness within the board.
   * @param input - Column creation data
   * @returns Created column
   * @throws ConstraintError if constraint violation occurs (e.g., duplicate status or position)
   * @throws DatabaseError if database operation fails
   */
  createColumn(input: CreateColumnInput): Promise<Column>;

  /**
   * Update an existing column.
   * Note: Business rules should validate column ordering and status uniqueness when updating position or status.
   * @param id - Column ID
   * @param input - Column update data
   * @returns Updated column
   * @throws NotFoundError if column not found
   * @throws ConstraintError if constraint violation occurs
   * @throws DatabaseError if database operation fails
   */
  updateColumn(id: string, input: UpdateColumnInput): Promise<Column>;

  /**
   * Delete a column by ID.
   * @param id - Column ID
   * @throws NotFoundError if column not found
   * @throws DatabaseError if database operation fails
   */
  deleteColumn(id: string): Promise<void>;

  /**
   * Bulk update column positions.
   * Used for drag-and-drop reordering of columns within a board.
   * @param columnPositions - Array of column ID and position pairs
   * @returns Array of updated columns
   * @throws NotFoundError if any column not found
   * @throws ConstraintError if constraint violation occurs (e.g., duplicate positions)
   * @throws DatabaseError if database operation fails
   */
  updateColumnPositions(
    columnPositions: Array<{ id: string; position: number }>
  ): Promise<Column[]>;
};
