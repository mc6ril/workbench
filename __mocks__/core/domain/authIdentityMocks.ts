import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";

/**
 * Mock current auth identity for testing.
 */
export const mockCurrentAuthIdentity: CurrentAuthIdentity = {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  loginEmail: "test@example.com",
  canUpdatePassword: true,
};
