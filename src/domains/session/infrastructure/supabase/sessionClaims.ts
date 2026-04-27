import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import { mapIdentityToCurrentSession } from "@/domains/session/infrastructure/sessionIdentity";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

export const mapSupabaseClaimsToCurrentSession = (
  claims: unknown
): CurrentSession | null => {
  if (!isRecord(claims)) {
    return null;
  }

  const appMetadata = claims.app_metadata;
  const userMetadata = claims.user_metadata;

  return mapIdentityToCurrentSession({
    userId: typeof claims.sub === "string" ? claims.sub : null,
    email: typeof claims.email === "string" ? claims.email : null,
    appMetadata: isRecord(appMetadata) ? appMetadata : null,
    userMetadata: isRecord(userMetadata) ? userMetadata : null,
  });
};
