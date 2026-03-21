import type { CurrentSession } from "@/domains/session/core/domain/currentSession.schema";

/**
 * Mock type for SessionRepository.
 */
export type SessionRepositoryMock = {
  getCurrentSession: jest.Mock<Promise<CurrentSession | null>, []>;
  canUpdatePassword: jest.Mock<Promise<boolean>, []>;
};

type SessionRepositoryMockOverrides = Partial<SessionRepositoryMock>;

/**
 * Factory for creating a mock SessionRepository.
 */
export const createSessionRepositoryMock = (
  overrides: SessionRepositoryMockOverrides = {}
): SessionRepositoryMock => {
  const base: SessionRepositoryMock = {
    getCurrentSession: jest.fn<Promise<CurrentSession | null>, []>(),
    canUpdatePassword: jest.fn<Promise<boolean>, []>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
