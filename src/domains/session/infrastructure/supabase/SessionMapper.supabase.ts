import type { Session } from "@supabase/supabase-js";

import { AppError, createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";

import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";
import { isSuperuserFromAppMetadata } from "@/domains/auth/infrastructure/supabase/providerCapabilities";
import type { CurrentSession } from "@/domains/session/core/domain/session.types";

const createAuthenticationError = (debugMessage: string): AppError =>
  createAppError(AUTH_ERROR_CODE.AUTHENTICATION_ERROR, { debugMessage });

/**
 * Maps Supabase Session to a CurrentSession.
 */
export const mapSupabaseSessionToCurrentSession = (
  session: Session,
  userEmail: string
): CurrentSession => {
  return {
    userId: session.user.id,
    loginEmail: userEmail,
    accessToken: session.access_token,
    isSuperuser: isSuperuserFromAppMetadata(session.user.app_metadata),
  };
};

export const mapAuthenticatedIdentityToCurrentSession = (identity: {
  id?: string | null;
  isSuperuser?: boolean;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
}): CurrentSession => {
  const userId =
    typeof identity.id === "string" && identity.id.length > 0
      ? identity.id
      : handleAuthError(
          createAuthenticationError(
            "User id not found in authenticated user data"
          )
        );
  const userEmail =
    typeof identity.email === "string" && identity.email.length > 0
      ? identity.email
      : handleAuthError(
          createAuthenticationError(
            "User email not found in authenticated user data"
          )
        );

  return {
    userId,
    loginEmail: userEmail,
    accessToken: "",
    isSuperuser: identity.isSuperuser ?? false,
  };
};
