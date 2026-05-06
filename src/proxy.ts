import { type NextRequest } from "next/server";

import { updateSession } from "@/shared/infrastructure/supabase/proxy";

export const proxy = async (request: NextRequest) => {
  return await updateSession(request);
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public SEO/PWA metadata routes that don't need Supabase session refresh
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|manifest(?:\\.webmanifest|/.*)?$|icon$|og/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
