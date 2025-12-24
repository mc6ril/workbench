export type TicketRepositoryMock = {
  listTickets: jest.Mock<Promise<unknown[]>, []>;
  getTicketById: jest.Mock<Promise<unknown | null>, [string]>;
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
    listTickets: jest.fn<Promise<unknown[]>, []>(),
    getTicketById: jest.fn<Promise<unknown | null>, [string]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
