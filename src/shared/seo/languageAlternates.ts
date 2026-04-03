import { defaultLocale } from "@/shared/i18n/config";
import type { Locale } from "@/shared/i18n/types";
import { getSiteUrl } from "@/shared/seo/siteUrl";

type Hreflang = Locale | "x-default";

/**
 * hreflang map for a marketing route.
 * The default locale is unprefixed; secondary locales keep their prefix.
 */
export const getLanguageAlternates = (
  buildPathForLocale: (locale: Locale) => string
): Record<Hreflang, string> => {
  const base = getSiteUrl();
  const fr = new URL(buildPathForLocale("fr"), base).toString();
  const en = new URL(buildPathForLocale("en"), base).toString();
  const es = new URL(buildPathForLocale("es"), base).toString();
  const xDefault = new URL(buildPathForLocale(defaultLocale), base).toString();

  return {
    "x-default": xDefault,
    fr,
    en,
    es,
  };
};
