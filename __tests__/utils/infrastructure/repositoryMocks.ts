export type TicketRepositoryMock = {
  listTickets: jest.Mock<Promise<unknown[]>, []>;
  getTicketById: jest.Mock<Promise<unknown | null>, [string]>;
};

type TicketRepositoryMockOverrides = Partial<TicketRepositoryMock>;

/**
 * Factory for a simple ticket repository mock.
 *
 * Tests can override only the methods they need while keeping the rest as jest.fn().
 */
export const createTicketRepositoryMock = (
  overrides: TicketRepositoryMockOverrides = {},
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
