import { cache } from "react";
import { redirect } from "next/navigation";

import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import { getCurrentAuthIdentity } from "./currentAuthIdentity";

import { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";

// cache() deduplicates calls within a single request render, so multiple
// layouts calling getSessionData() share one Supabase round-trip.
export const getSessionData = cache(async (): Promise<CurrentAuthIdentity> => {
  const client = await createSupabaseServerClient();
  const identity = await getCurrentAuthIdentity(client);
  if (!identity) {
    // Middleware should prevent unauthenticated access to protected routes,
    // but session can become invalid (expired token, revoked session) after
    // the middleware check. Redirect to sign-in rather than crashing.
    redirect(AUTH_PAGE_ROUTES.SIGNIN);
  }
  return identity;
});
