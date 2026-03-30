import type { CurrentSession } from "@/domains/session/core/domain/session.types";

/**
 * Mock current session for testing.
 */
export const mockCurrentSession: CurrentSession = {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  loginEmail: "test@example.com",
  accessToken: "mock-access-token",
  isSuperuser: false,
};
