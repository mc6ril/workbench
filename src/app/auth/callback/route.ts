import { type NextRequest, NextResponse } from "next/server";

import { exchangeCodeForSession } from "@/core/usecases/auth/exchangeCodeForSession";

import { createAuthRepository } from "@/infrastructure/supabase/auth/AuthRepository.supabase";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";

/**
 * Auth callback route handler for Supabase PKCE flow.
 * Exchanges the authorization code for a session, then redirects
 * to the target page (e.g., /auth/update-password after password reset).
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";

  // Security: reject protocol-relative URLs (//evil.com) and absolute URLs
  // to prevent open redirect attacks via crafted callback links.
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

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

  return NextResponse.redirect(`${origin}/auth/signin`);
};
