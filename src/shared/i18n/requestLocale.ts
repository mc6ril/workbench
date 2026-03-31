import { cache } from "react";
import { cookies, headers } from "next/headers";

import {
  localeCookieName,
  matchSupportedLocale,
  requestLocaleHeaderName,
  resolveLocale,
} from "./config";
import type { Locale } from "./types";

import "server-only";

/**
 * Resolves the locale for the current request.
 * Priority:
 * 1. Middleware-injected header (from URL prefix when present)
 * 2. Persisted locale cookie
 * 3. Accept-Language
 * 4. Default locale
 */
export const getRequestLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const fromMiddleware = headerStore.get(requestLocaleHeaderName);
  const fromHeader = matchSupportedLocale(fromMiddleware);
  if (fromHeader) {
    return fromHeader;
  }

  return resolveLocale({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
});
