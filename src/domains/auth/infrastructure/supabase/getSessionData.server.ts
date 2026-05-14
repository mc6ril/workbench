import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import { getCurrentAuthIdentity } from "./currentAuthIdentity";

import { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";

export const getSessionData = async (): Promise<CurrentAuthIdentity> => {
  const client = await createSupabaseServerClient();
  const identity = await getCurrentAuthIdentity(client);
  if (!identity) {
    throw createAppError(AUTH_ERROR_CODE.AUTHENTICATION_ERROR, {
      debugMessage: "Authenticated user identity is required",
    });
  }
  return identity;
};
