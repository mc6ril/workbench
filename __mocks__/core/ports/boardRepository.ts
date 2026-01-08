import type {
  Board,
  Column,
  CreateBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
} from "@/core/domain/schema/board.schema";

/**
 * Mock type for BoardRepository.
 * Used for type-safe mock creation in tests.
 */
export type BoardRepositoryMock = {
  findById: jest.Mock<Promise<Board | null>, [string]>;
  findByProject: jest.Mock<Promise<Board | null>, [string]>;
  create: jest.Mock<Promise<Board>, [CreateBoardInput]>;
  delete: jest.Mock<Promise<void>, [string]>;
  listColumnsByBoard: jest.Mock<Promise<Column[]>, [string]>;
  findColumnById: jest.Mock<Promise<Column | null>, [string]>;
  createColumn: jest.Mock<Promise<Column>, [CreateColumnInput]>;
  updateColumn: jest.Mock<Promise<Column>, [string, UpdateColumnInput]>;
  deleteColumn: jest.Mock<Promise<void>, [string]>;
  updateColumnPositions: jest.Mock<
    Promise<Column[]>,
    [Array<{ id: string; position: number }>]
  >;
};

type BoardRepositoryMockOverrides = Partial<BoardRepositoryMock>;

/**
 * Factory for creating a mock BoardRepository.
 *
 * Tests can override only the methods they need while keeping the rest as jest.fn().
 *
 * @param overrides - Partial mock to override specific methods
 * @returns A mock BoardRepository
 */
export const createBoardRepositoryMock = (
  overrides: BoardRepositoryMockOverrides = {}
): BoardRepositoryMock => {
  const base: BoardRepositoryMock = {
    findById: jest.fn<Promise<Board | null>, [string]>(),
    findByProject: jest.fn<Promise<Board | null>, [string]>(),
    create: jest.fn<Promise<Board>, [CreateBoardInput]>(),
    delete: jest.fn<Promise<void>, [string]>(),
    listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(),
    findColumnById: jest.fn<Promise<Column | null>, [string]>(),
    createColumn: jest.fn<Promise<Column>, [CreateColumnInput]>(),
    updateColumn: jest.fn<Promise<Column>, [string, UpdateColumnInput]>(),
    deleteColumn: jest.fn<Promise<void>, [string]>(),
    updateColumnPositions: jest.fn<
      Promise<Column[]>,
      [Array<{ id: string; position: number }>]
    >(),
  };

  return {
    ...base,
    ...overrides,
  };
};
