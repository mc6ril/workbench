import type {
  JwtPayload,
  Session,
  SupabaseClient,
} from "@supabase/supabase-js";

import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { isRecord } from "@/shared/utils";

import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";
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

  const userMetadata = claims.user_metadata;
  if (
    isRecord(userMetadata) &&
    typeof userMetadata.email === "string" &&
    userMetadata.email.length > 0
  ) {
    return userMetadata.email;
  }

  return null;
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
  };
};

export const getCurrentAuthIdentity = async (
  client: SupabaseClient
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
  client: SupabaseClient
): Promise<CurrentAuthIdentity> => {
  const identity = await getCurrentAuthIdentity(client);

  if (!identity) {
    throw createAppError(AUTH_ERROR_CODE.AUTHENTICATION_ERROR, {
      debugMessage: "Authenticated user identity is required",
    });
  }

  return identity;
};
