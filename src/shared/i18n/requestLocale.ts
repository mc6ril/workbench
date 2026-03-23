import { cache } from "react";
import { cookies, headers } from "next/headers";

import { localeCookieName, resolveLocale } from "./config";
import type { Locale } from "./types";

import "server-only";

/**
 * Resolves the locale for the current request using the persisted locale
 * cookie when available, otherwise the browser's Accept-Language header.
 */
export const getRequestLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  return resolveLocale({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
});
