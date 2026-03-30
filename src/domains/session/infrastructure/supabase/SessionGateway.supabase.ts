import type { SupabaseClient } from "@supabase/supabase-js";

import type { AppError } from "@/shared/errors/appError";
import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";

import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";
import {
  canUpdatePasswordFromAppMetadata,
  isSuperuserFromAppMetadata,
} from "@/domains/auth/infrastructure/supabase/providerCapabilities";
import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";
import { mapSupabaseSessionToCurrentSession } from "@/domains/session/infrastructure/supabase/SessionMapper.supabase";

const createAuthenticationError = (debugMessage: string): AppError =>
  createAppError(AUTH_ERROR_CODE.AUTHENTICATION_ERROR, { debugMessage });

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
          isSuperuser: isSuperuserFromAppMetadata(user.app_metadata),
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
