import type { CurrentSession } from "@/domains/session/core/domain/session.types";

/**
 * Mock type for SessionGateway.
 */
export type SessionGatewayMock = {
  getCurrentSession: jest.Mock<Promise<CurrentSession | null>, []>;
  canUpdatePassword: jest.Mock<Promise<boolean>, []>;
};

type SessionGatewayMockOverrides = Partial<SessionGatewayMock>;

/**
 * Factory for creating a mock SessionGateway.
 */
export const createSessionGatewayMock = (
  overrides: SessionGatewayMockOverrides = {}
): SessionGatewayMock => {
  const base: SessionGatewayMock = {
    getCurrentSession: jest.fn<Promise<CurrentSession | null>, []>(),
    canUpdatePassword: jest.fn<Promise<boolean>, []>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
