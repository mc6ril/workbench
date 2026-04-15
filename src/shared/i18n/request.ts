import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { localeCookieName, resolveLocale } from "./config";
import type { IntlMessages } from "./messageCatalog";
import type { Locale } from "./routing";

const messageLoaders: Record<Locale, () => Promise<IntlMessages>> = {
  fr: async () => (await import("./messages/fr.json")).default,
  en: async () => (await import("./messages/en.json")).default,
  es: async () => (await import("./messages/es.json")).default,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveLocale({
    preferredLocale: requestedLocale,
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return {
    locale,
    messages: await messageLoaders[locale](),
  };
});
