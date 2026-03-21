import type { SupabaseClient } from "@supabase/supabase-js";

import { AUTH_ERROR_CODE } from "@/shared/constants/errorCodes";
import { handleAuthError } from "@/shared/infrastructure/errors/errorHandlers";

import type { SessionRepository } from "@/domains/session/core/ports/sessionRepository";
import { mapSupabaseSessionToCurrentSession } from "@/domains/session/infrastructure/supabase/SessionMapper.supabase";
import { canUpdatePasswordFromAppMetadata } from "@/domains/session/infrastructure/supabase/sessionProviderCapabilities";

const createAuthenticationError = (debugMessage: string) => ({
  code: AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
  debugMessage,
});

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
 * Create a SessionRepository implementation using the provided Supabase client.
 */
export const createSessionRepository = (
  client: SupabaseClient
): SessionRepository => ({
  async canUpdatePassword(): Promise<boolean> {
    try {
      const {
        data: { user },
        error,
      } = await client.auth.getUser();

      if (error) {
        if (isAuthSessionMissingError(error)) {
          return false;
        }

        handleAuthError(error);
      }

      if (!user) {
        return false;
      }

      return canUpdatePasswordFromAppMetadata(user.app_metadata);
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async getCurrentSession() {
    try {
      const isServerContext = typeof window === "undefined";

      if (isServerContext) {
        const {
          data: { user },
          error,
        } = await client.auth.getUser();

        if (error) {
          if (isAuthSessionMissingError(error)) {
            return null;
          }

          handleAuthError(error);
        }

        if (!user) {
          return null;
        }

        const userEmail = user.email;
        if (!userEmail) {
          handleAuthError(
            createAuthenticationError(
              "User email not found in authenticated user data"
            )
          );
        }

        return {
          userId: user.id,
          loginEmail: userEmail!,
          accessToken: "",
          isSuperuser: user.app_metadata?.is_superuser === true,
        };
      }

      const {
        data: { session },
        error,
      } = await client.auth.getSession();

      if (error) {
        handleAuthError(error);
      }

      if (!session) {
        return null;
      }

      const userEmail = session.user.email;
      if (!userEmail) {
        handleAuthError(
          createAuthenticationError("User email not found in session")
        );
      }

      return mapSupabaseSessionToCurrentSession(session, userEmail!);
    } catch (error) {
      return handleAuthError(error);
    }
  },
});
