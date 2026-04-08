export const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

export const routing = {
  locales: ["fr", "en", "es"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  localeCookie: {
    name: "workbench-locale",
    sameSite: "lax",
    path: "/",
    maxAge: localeCookieMaxAgeSeconds,
  },
  alternateLinks: false,
} as const;
