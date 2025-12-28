import type {
  CreateTicketInput,
  Ticket,
  UpdateTicketInput,
} from "@/core/domain/ticket.schema";

/**
 * Mock type for TicketRepository.
 * Used for type-safe mock creation in tests.
 */
export type TicketRepositoryMock = {
  findById: jest.Mock<Promise<Ticket | null>, [string]>;
  listByProject: jest.Mock<Promise<Ticket[]>, [string]>;
  listByStatus: jest.Mock<Promise<Ticket[]>, [string, string]>;
  create: jest.Mock<Promise<Ticket>, [CreateTicketInput]>;
  update: jest.Mock<Promise<Ticket>, [string, UpdateTicketInput]>;
  delete: jest.Mock<Promise<void>, [string]>;
};

type TicketRepositoryMockOverrides = Partial<TicketRepositoryMock>;

/**
 * Factory for creating a mock TicketRepository.
 *
 * Tests can override only the methods they need while keeping the rest as jest.fn().
 *
 * @param overrides - Partial mock to override specific methods
 * @returns A mock TicketRepository
 */
export const createTicketRepositoryMock = (
  overrides: TicketRepositoryMockOverrides = {}
): TicketRepositoryMock => {
  const base: TicketRepositoryMock = {
    findById: jest.fn<Promise<Ticket | null>, [string]>(),
    listByProject: jest.fn<Promise<Ticket[]>, [string]>(),
    listByStatus: jest.fn<Promise<Ticket[]>, [string, string]>(),
    create: jest.fn<Promise<Ticket>, [CreateTicketInput]>(),
    update: jest.fn<Promise<Ticket>, [string, UpdateTicketInput]>(),
    delete: jest.fn<Promise<void>, [string]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
