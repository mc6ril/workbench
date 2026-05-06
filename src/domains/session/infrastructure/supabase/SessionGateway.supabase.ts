import type { SupabaseClient } from "@supabase/supabase-js";

import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";
import { canUpdatePasswordFromAppMetadata } from "@/domains/auth/infrastructure/supabase/providerCapabilities";
import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";
import { mapAuthenticatedIdentityToCurrentSession } from "@/domains/session/infrastructure/supabase/SessionMapper.supabase";

const isAuthSessionMissingError = (error: unknown): boolean => {
  return (
    !!error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "AuthSessionMissingError" &&
    "message" in error &&
    error.message === "Auth session missing!"
  );
};

/**
 * Create a SessionGateway implementation using the provided Supabase client.
 */
export const createSessionGateway = (
  client: SupabaseClient
): SessionGateway => ({
  async canUpdatePassword(): Promise<boolean> {
    try {
      const { data, error } = await client.auth.getClaims();

      if (error) {
        if (isAuthSessionMissingError(error)) {
          return false;
        }

        handleAuthError(error);
      }

      const claims = data?.claims;

      if (!claims) {
        return false;
      }

      return canUpdatePasswordFromAppMetadata(claims?.app_metadata);
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async getCurrentSession() {
    try {
      const { data, error } = await client.auth.getClaims();

      if (error) {
        if (isAuthSessionMissingError(error)) {
          return null;
        }

        handleAuthError(error);
      }

      const claims = data?.claims;

      if (!claims) {
        return null;
      }

      return mapAuthenticatedIdentityToCurrentSession(claims);
    } catch (error) {
      return handleAuthError(error);
    }
  },
});
