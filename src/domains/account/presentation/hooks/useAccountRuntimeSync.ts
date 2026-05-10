"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";

import { persistLocaleCookie, useLocale } from "@/shared/i18n";
import {
  defaultLocale,
  type Locale,
  supportedLocales,
} from "@/shared/i18n/config";
import {
  persistThemeCookie,
  resolveThemePreference,
} from "@/shared/theme/config";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";

export const useAccountRuntimeSync = (): boolean => {
  const { data: identity } = useAuthIdentity();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const lastSyncedLocaleRef = useRef<Locale | null>(null);
  const lastSyncedThemeRef = useRef<string | null>(null);

  const hasAuthenticatedIdentity = !!identity?.userId;

  const nextLocale = useMemo<Locale | null>(() => {
    const language = identity?.preferences?.language;

    if (!language) {
      return null;
    }

    return supportedLocales.includes(language as Locale)
      ? (language as Locale)
      : defaultLocale;
  }, [identity?.preferences?.language]);

  const nextTheme = useMemo(() => {
    const identityTheme = identity?.preferences?.theme;

    if (!identityTheme) {
      return null;
    }

    return resolveThemePreference(identityTheme);
  }, [identity?.preferences?.theme]);

  useEffect(() => {
    if (!hasAuthenticatedIdentity || !nextLocale || locale === nextLocale) {
      lastSyncedLocaleRef.current = null;
      return;
    }

    if (lastSyncedLocaleRef.current === nextLocale) {
      return;
    }

    persistLocaleCookie(nextLocale);
    lastSyncedLocaleRef.current = nextLocale;
  }, [hasAuthenticatedIdentity, locale, nextLocale]);

  useEffect(() => {
    if (!hasAuthenticatedIdentity || !nextTheme) {
      lastSyncedThemeRef.current = null;
      return;
    }

    if (lastSyncedThemeRef.current !== nextTheme) {
      persistThemeCookie(nextTheme);
      lastSyncedThemeRef.current = nextTheme;
    }

    if (theme !== nextTheme) {
      setTheme(nextTheme);
    }
  }, [hasAuthenticatedIdentity, nextTheme, setTheme, theme]);

  return true;
};
