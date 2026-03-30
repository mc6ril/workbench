import type { CurrentSession } from "@/domains/session/core/domain/session.types";

/**
 * Gateway contract for current identity/session read operations.
 */
export type SessionGateway = {
  /**
   * Returns the current authenticated session, or null when unauthenticated.
   */
  getCurrentSession(): Promise<CurrentSession | null>;

  /**
   * Returns whether the current authenticated user can manage a password.
   */
  canUpdatePassword(): Promise<boolean>;
};
