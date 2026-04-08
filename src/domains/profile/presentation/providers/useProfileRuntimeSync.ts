"use client";

import { useEffect, useMemo } from "react";
import { useTheme } from "next-themes";

import {
  defaultLocale,
  persistLocaleCookie,
  supportedLocales,
} from "@/shared/i18n/config";
import type { Locale } from "@/shared/i18n/types";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";

import { resolveThemePreference } from "@/domains/profile/core/domain/profile.types";
import { useMyProfile } from "@/domains/profile/presentation/hooks/useMyProfile";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

/**
 * Applies the authenticated user's runtime preferences (locale + theme) and
 * reports whether the app can render without waiting for the profile query.
 */
export const useProfileRuntimeSync = (): boolean => {
  const { data: session } = useSession();
  const profileQuery = useMyProfile();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const { theme, setTheme } = useTheme();

  const hasAuthenticatedSession = !!session?.userId;

  const nextLocale = useMemo<Locale | null>(() => {
    const language = profileQuery.data?.preferences?.language;

    if (!language) {
      return null;
    }

    return supportedLocales.includes(language as Locale)
      ? (language as Locale)
      : defaultLocale;
  }, [profileQuery.data?.preferences?.language]);

  const nextTheme = useMemo(() => {
    const profileTheme = profileQuery.data?.preferences?.theme;

    if (!profileTheme) {
      return null;
    }

    return resolveThemePreference(profileTheme);
  }, [profileQuery.data?.preferences?.theme]);

  useEffect(() => {
    if (!hasAuthenticatedSession || !nextLocale || locale === nextLocale) {
      return;
    }

    setLocale(nextLocale);
    persistLocaleCookie(nextLocale);
  }, [hasAuthenticatedSession, locale, nextLocale, setLocale]);

  useEffect(() => {
    if (!hasAuthenticatedSession || !nextTheme || theme === nextTheme) {
      return;
    }

    setTheme(nextTheme);
  }, [hasAuthenticatedSession, nextTheme, setTheme, theme]);

  if (!hasAuthenticatedSession) {
    return true;
  }

  if (profileQuery.isLoading || profileQuery.isPending) {
    return false;
  }

  if (profileQuery.isError) {
    return true;
  }

  return true;
};
