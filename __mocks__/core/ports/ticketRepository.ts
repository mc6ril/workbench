import type {
  CreateTicketInput,
  Ticket,
  TicketAssignee,
  TicketFilters,
  TicketSort,
  UpdateTicketInput,
} from "@/modules/board/core/domain/schema/ticket.schema";

/**
 * Mock type for TicketRepository.
 * Used for type-safe mock creation in tests.
 */
export type TicketRepositoryMock = {
  getNextCodeNumberForProject: jest.Mock<Promise<number>, [string]>;
  findByCode: jest.Mock<Promise<Ticket | null>, [string, number]>;
  findById: jest.Mock<Promise<Ticket | null>, [string]>;
  listByProject: jest.Mock<
    Promise<Ticket[]>,
    [string, TicketFilters?, TicketSort?, string?, number?]
  >;
  listByStatus: jest.Mock<Promise<Ticket[]>, [string, string]>;
  create: jest.Mock<Promise<Ticket>, [CreateTicketInput]>;
  update: jest.Mock<Promise<Ticket>, [string, UpdateTicketInput]>;
  delete: jest.Mock<Promise<void>, [string]>;
  updatePositions: jest.Mock<
    Promise<Ticket[]>,
    [Array<{ id: string; position: number }>]
  >;
  moveTicket: jest.Mock<Promise<Ticket>, [string, string, number, Date | null]>;
  moveAndReorderTicket: jest.Mock<
    Promise<Ticket[]>,
    [
      {
        ticketId: string;
        status: string;
        position: number;
        completedAt: Date | null;
        ticketPositions: Array<{ id: string; position: number }>;
      },
    ]
  >;
  assignToEpic: jest.Mock<Promise<Ticket>, [string, string]>;
  unassignFromEpic: jest.Mock<Promise<Ticket>, [string]>;
  assignUsers: jest.Mock<Promise<void>, [string, string[]]>;
  unassignUsers: jest.Mock<Promise<void>, [string, string[]]>;
  getAssignees: jest.Mock<Promise<TicketAssignee[]>, [string]>;
  getAssigneesByTicketIds: jest.Mock<
    Promise<Record<string, TicketAssignee[]>>,
    [string[]]
  >;
  getAssigneesByProjectId: jest.Mock<
    Promise<Record<string, TicketAssignee[]>>,
    [string]
  >;
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
    getNextCodeNumberForProject: jest.fn<Promise<number>, [string]>(),
    findByCode: jest.fn<Promise<Ticket | null>, [string, number]>(),
    findById: jest.fn<Promise<Ticket | null>, [string]>(),
    listByProject: jest.fn<
      Promise<Ticket[]>,
      [string, TicketFilters?, TicketSort?, string?, number?]
    >(),
    listByStatus: jest.fn<Promise<Ticket[]>, [string, string]>(),
    create: jest.fn<Promise<Ticket>, [CreateTicketInput]>(),
    update: jest.fn<Promise<Ticket>, [string, UpdateTicketInput]>(),
    delete: jest.fn<Promise<void>, [string]>(),
    updatePositions: jest.fn<
      Promise<Ticket[]>,
      [Array<{ id: string; position: number }>]
    >(),
    moveTicket: jest.fn<
      Promise<Ticket>,
      [string, string, number, Date | null]
    >(),
    moveAndReorderTicket: jest.fn<
      Promise<Ticket[]>,
      [
        {
          ticketId: string;
          status: string;
          position: number;
          completedAt: Date | null;
          ticketPositions: Array<{ id: string; position: number }>;
        },
      ]
    >(),
    assignToEpic: jest.fn<Promise<Ticket>, [string, string]>(),
    unassignFromEpic: jest.fn<Promise<Ticket>, [string]>(),
    assignUsers: jest.fn<Promise<void>, [string, string[]]>(),
    unassignUsers: jest.fn<Promise<void>, [string, string[]]>(),
    getAssignees: jest.fn<Promise<TicketAssignee[]>, [string]>(),
    getAssigneesByTicketIds: jest.fn<
      Promise<Record<string, TicketAssignee[]>>,
      [string[]]
    >(),
    getAssigneesByProjectId: jest.fn<
      Promise<Record<string, TicketAssignee[]>>,
      [string]
    >(),
  };

  return {
    ...base,
    ...overrides,
  };
};
