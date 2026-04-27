import type { SupabaseClient } from "@supabase/supabase-js";

import type { AppError } from "@/shared/errors/appError";
import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { hasSupabaseAuthCookieInHeader } from "@/shared/utils/supabaseAuthCookies";

import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";
import { canUpdatePasswordFromAppMetadata } from "@/domains/auth/infrastructure/supabase/providerCapabilities";
import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import type { SessionGateway } from "@/domains/session/core/ports/session.gateway";
import { mapIdentityToCurrentSession } from "@/domains/session/infrastructure/sessionIdentity";

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

const hasBrowserAuthCookie = (): boolean => {
  if (typeof document === "undefined") {
    return false;
  }

  return hasSupabaseAuthCookieInHeader(document.cookie);
};

const mapAuthenticatedIdentityToCurrentSession = (identity: {
  id?: string | null;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}): CurrentSession => {
  const mapped = mapIdentityToCurrentSession({
    userId: identity.id,
    email: identity.email,
    appMetadata: identity.app_metadata ?? null,
    userMetadata: identity.user_metadata ?? null,
  });

  if (!mapped) {
    return handleAuthError(
      createAuthenticationError("Invalid authenticated user identity payload")
    );
  }

  return mapped;
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

        return mapAuthenticatedIdentityToCurrentSession({
          id: claims.sub,
          email: claims.email,
          app_metadata: claims.app_metadata,
          user_metadata: claims.user_metadata,
        });
      }

      if (!hasBrowserAuthCookie()) {
        return null;
      }

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

      return mapAuthenticatedIdentityToCurrentSession(user);
    } catch (error) {
      return handleAuthError(error);
    }
  },
});
