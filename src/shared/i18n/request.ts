import { getRequestConfig } from "next-intl/server";

import { isSupportedLocale } from "./config";
import { routing } from "./routing";
import type { Locale } from "./types";

type Messages = typeof import("./messages/fr.json");

const messageLoaders: Record<Locale, () => Promise<Messages>> = {
  fr: async () => (await import("./messages/fr.json")).default,
  en: async () => (await import("./messages/en.json")).default,
  es: async () => (await import("./messages/es.json")).default,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const localeCandidate = requestedLocale ?? "";
  const locale = isSupportedLocale(localeCandidate)
    ? localeCandidate
    : routing.defaultLocale;

  return {
    locale,
    messages: await messageLoaders[locale](),
  };
});
