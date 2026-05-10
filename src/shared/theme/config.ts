import {
  APP_COOKIE_KEYS,
  getCookie,
  updateCookie,
} from "@/shared/infrastructure/storage/cookies";

export const ThemeValues = ["light", "dark", "system"] as const;
export type Theme = (typeof ThemeValues)[number];

export const isThemePreference = (value: string): value is Theme => {
  return (ThemeValues as readonly string[]).includes(value);
};

export const resolveThemePreference = (
  value?: string | null,
  fallback: Theme = "system"
): Theme => {
  if (!value) {
    return fallback;
  }

  return isThemePreference(value) ? value : fallback;
};

export const themeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;
export const themeCookieName = APP_COOKIE_KEYS.THEME;

type ThemeCookieSource =
  | string
  | { get(name: string): { value?: string } | undefined };

export const getThemePreferenceFromCookie = (
  source?: ThemeCookieSource
): Theme | null => {
  const rawTheme = getCookie(themeCookieName, source);

  return rawTheme && isThemePreference(rawTheme) ? rawTheme : null;
};

export const persistThemeCookie = (theme: Theme): void => {
  if (typeof document === "undefined") {
    return;
  }

  updateCookie(themeCookieName, theme, {
    maxAgeSeconds: themeCookieMaxAgeSeconds,
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
  });
};
