import type { Locale } from "@/shared/i18n/types";
import { getSiteUrl } from "@/shared/seo/siteUrl";

type Hreflang = Locale | "x-default";

/**
 * Returns language alternates for a route.
 *
 * Note: URLs are not locale-prefixed in this app today. We still expose hreflang
 * hints to help crawlers understand the language variants served on the same URL.
 */
export const getLanguageAlternates = (
  pathname: string
): Record<Hreflang, string> => {
  const base = getSiteUrl();
  const url = new URL(pathname, base).toString();

  return {
    "x-default": url,
    fr: url,
    en: url,
    es: url,
  };
};

