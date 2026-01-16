import type {
  CreateTicketInput,
  Ticket,
  TicketFilters,
  UpdateTicketInput,
} from "@/core/domain/schema/ticket.schema";

/**
 * Mock type for TicketRepository.
 * Used for type-safe mock creation in tests.
 */
export type TicketRepositoryMock = {
  findById: jest.Mock<Promise<Ticket | null>, [string]>;
  listByProject: jest.Mock<Promise<Ticket[]>, [string, TicketFilters?]>;
  listByStatus: jest.Mock<Promise<Ticket[]>, [string, string]>;
  create: jest.Mock<Promise<Ticket>, [CreateTicketInput]>;
  update: jest.Mock<Promise<Ticket>, [string, UpdateTicketInput]>;
  delete: jest.Mock<Promise<void>, [string]>;
  updatePositions: jest.Mock<
    Promise<Ticket[]>,
    [Array<{ id: string; position: number }>]
  >;
  moveTicket: jest.Mock<Promise<Ticket>, [string, string, number]>;
  assignToEpic: jest.Mock<Promise<Ticket>, [string, string]>;
  unassignFromEpic: jest.Mock<Promise<Ticket>, [string]>;
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
    listByProject: jest.fn<Promise<Ticket[]>, [string, TicketFilters?]>(),
    listByStatus: jest.fn<Promise<Ticket[]>, [string, string]>(),
    create: jest.fn<Promise<Ticket>, [CreateTicketInput]>(),
    update: jest.fn<Promise<Ticket>, [string, UpdateTicketInput]>(),
    delete: jest.fn<Promise<void>, [string]>(),
    updatePositions: jest.fn<
      Promise<Ticket[]>,
      [Array<{ id: string; position: number }>]
    >(),
    moveTicket: jest.fn<Promise<Ticket>, [string, string, number]>(),
    assignToEpic: jest.fn<Promise<Ticket>, [string, string]>(),
    unassignFromEpic: jest.fn<Promise<Ticket>, [string]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
