import type { JwtPayload, Session } from "@supabase/supabase-js";

import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import type { AppSupabaseAuthClient } from "@/shared/infrastructure/supabase/types";

import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";
import {
  getAuthUserMetadataEmail,
  getAuthUserMetadataPreferences,
} from "@/domains/auth/infrastructure/supabase/AuthMetadata.supabase";
import { canUpdatePasswordFromAppMetadata } from "@/domains/auth/infrastructure/supabase/providerCapabilities";

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

const getClaimEmail = (claims: JwtPayload): string | null => {
  if (typeof claims.email === "string" && claims.email.length > 0) {
    return claims.email;
  }

  return getAuthUserMetadataEmail(claims.user_metadata);
};

export const mapSupabaseClaimsToCurrentAuthIdentity = (
  claims: JwtPayload
): CurrentAuthIdentity | null => {
  const userId = claims.sub;
  const loginEmail = getClaimEmail(claims);

  if (!userId || !loginEmail) {
    return null;
  }

  return {
    userId,
    loginEmail,
    canUpdatePassword: canUpdatePasswordFromAppMetadata(claims.app_metadata),
    preferences: getAuthUserMetadataPreferences(claims.user_metadata),
  };
};

export const mapSupabaseSessionToCurrentAuthIdentity = (
  session: Session,
  fallbackEmail?: string
): CurrentAuthIdentity => {
  return {
    userId: session.user.id,
    loginEmail: session.user.email || fallbackEmail || "",
    canUpdatePassword: canUpdatePasswordFromAppMetadata(
      session.user.app_metadata
    ),
    preferences: getAuthUserMetadataPreferences(session.user.user_metadata),
  };
};

export const getCurrentAuthIdentity = async (
  client: AppSupabaseAuthClient
): Promise<CurrentAuthIdentity | null> => {
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

    return mapSupabaseClaimsToCurrentAuthIdentity(claims);
  } catch (error) {
    return handleAuthError(error);
  }
};

export const requireCurrentAuthIdentity = async (
  client: AppSupabaseAuthClient
): Promise<CurrentAuthIdentity> => {
  const identity = await getCurrentAuthIdentity(client);

  if (!identity) {
    throw createAppError(AUTH_ERROR_CODE.AUTHENTICATION_ERROR, {
      debugMessage: "Authenticated user identity is required",
    });
  }

  return identity;
};
