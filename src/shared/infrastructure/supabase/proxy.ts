import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { isProtectedRoute } from "@/shared/utils/routes";

const copySupabaseResponseState = (
  source: NextResponse,
  target: NextResponse
): void => {
  // Any response replacing supabaseResponse must preserve state set by
  // Supabase during getClaims(), or browser/server sessions can drift.
  source.headers.forEach((value, key) => {
    if (
      key.toLowerCase() === "location" ||
      key.toLowerCase() === "set-cookie"
    ) {
      return;
    }

    target.headers.set(key, value);
  });
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
};

const buildSigninRedirectResponse = (
  request: NextRequest,
  supabaseResponse: NextResponse
): NextResponse => {
  const url = request.nextUrl.clone();
  const redirectPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = AUTH_PAGE_ROUTES.SIGNIN;
  url.search = "";
  url.searchParams.set("redirect", redirectPath);

  const response = NextResponse.redirect(url);
  // Redirect responses cannot return supabaseResponse as-is, so copy its
  // Supabase-managed cookies/headers before returning the redirect.
  copySupabaseResponseState(supabaseResponse, response);

  return response;
};

const buildWorkspaceRedirectResponse = (
  request: NextRequest,
  supabaseResponse: NextResponse
): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = PAGE_ROUTES.WORKSPACE;
  url.search = "";

  const response = NextResponse.redirect(url);
  // Redirect responses cannot return supabaseResponse as-is, so copy its
  // Supabase-managed cookies/headers before returning the redirect.
  copySupabaseResponseState(supabaseResponse, response);

  return response;
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;
  const pathname = request.nextUrl.pathname;

  if (
    user &&
    (pathname === AUTH_PAGE_ROUTES.SIGNIN ||
      pathname === AUTH_PAGE_ROUTES.SIGNUP)
  ) {
    return buildWorkspaceRedirectResponse(request, supabaseResponse);
  }

  if (!user && isProtectedRoute(pathname)) {
    return buildSigninRedirectResponse(request, supabaseResponse);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
