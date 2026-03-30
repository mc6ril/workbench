import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";

/**
 * Returns whether the current authenticated user can update a password.
 */
export const canUpdatePassword = async (
  gateway: SessionGateway
): Promise<boolean> => {
  return gateway.canUpdatePassword();
};
