import { type NextRequest, NextResponse } from "next/server";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { sanitizeInternalRedirectPath } from "@/shared/utils/authRedirect";

import { exchangeCodeForSession } from "@/domains/auth/core/usecases/exchangeCodeForSession";
import { createAuthRepository } from "@/domains/auth/infrastructure/supabase/repositories";

/**
 * Auth callback route handler for Supabase PKCE flow.
 * Exchanges the authorization code for a session, then redirects
 * to the target page (e.g., /auth/update-password after password reset).
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? PAGE_ROUTES.HOME;
  const next = sanitizeInternalRedirectPath(nextParam, PAGE_ROUTES.HOME);

  if (code) {
    try {
      const supabaseClient = await createSupabaseServerClient();
      const authRepo = createAuthRepository(supabaseClient);
      await exchangeCodeForSession(authRepo, code);

      return NextResponse.redirect(`${origin}${next}`);
    } catch {
      // Fall through to error redirect
    }
  }

  return NextResponse.redirect(`${origin}${AUTH_PAGE_ROUTES.SIGNIN}`);
};
