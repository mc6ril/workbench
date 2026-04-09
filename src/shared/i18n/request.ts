import { getRequestConfig } from "next-intl/server";

import { isSupportedLocale } from "./config";
import type { IntlMessages } from "./messageCatalog";
import { type Locale, routing } from "./routing";

const messageLoaders: Record<Locale, () => Promise<IntlMessages>> = {
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
