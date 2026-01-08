import type {
  CreateEpicInput,
  Epic,
  UpdateEpicInput,
} from "@/core/domain/schema/epic.schema";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

/**
 * Mock type for EpicRepository.
 * Used for type-safe mock creation in tests.
 */
export type EpicRepositoryMock = {
  findById: jest.Mock<Promise<Epic | null>, [string]>;
  listByProject: jest.Mock<Promise<Epic[]>, [string]>;
  create: jest.Mock<Promise<Epic>, [CreateEpicInput]>;
  update: jest.Mock<Promise<Epic>, [string, UpdateEpicInput]>;
  delete: jest.Mock<Promise<void>, [string]>;
  assignTicketToEpic: jest.Mock<Promise<Ticket>, [string, string]>;
  unassignTicketFromEpic: jest.Mock<Promise<Ticket>, [string]>;
  listTicketsByEpic: jest.Mock<Promise<Ticket[]>, [string]>;
};

type EpicRepositoryMockOverrides = Partial<EpicRepositoryMock>;

/**
 * Factory for creating a mock EpicRepository.
 *
 * Tests can override only the methods they need while keeping the rest as jest.fn().
 *
 * @param overrides - Partial mock to override specific methods
 * @returns A mock EpicRepository
 */
export const createEpicRepositoryMock = (
  overrides: EpicRepositoryMockOverrides = {}
): EpicRepositoryMock => {
  const base: EpicRepositoryMock = {
    findById: jest.fn<Promise<Epic | null>, [string]>(),
    listByProject: jest.fn<Promise<Epic[]>, [string]>(),
    create: jest.fn<Promise<Epic>, [CreateEpicInput]>(),
    update: jest.fn<Promise<Epic>, [string, UpdateEpicInput]>(),
    delete: jest.fn<Promise<void>, [string]>(),
    assignTicketToEpic: jest.fn<Promise<Ticket>, [string, string]>(),
    unassignTicketFromEpic: jest.fn<Promise<Ticket>, [string]>(),
    listTicketsByEpic: jest.fn<Promise<Ticket[]>, [string]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
