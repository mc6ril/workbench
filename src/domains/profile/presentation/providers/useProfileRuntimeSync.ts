"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";

import { persistLocaleCookie, useLocale } from "@/shared/i18n";
import {
  defaultLocale,
  type Locale,
  supportedLocales,
} from "@/shared/i18n/config";
import { persistThemeCookie } from "@/shared/theme/config";

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
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const lastSyncedLocaleRef = useRef<Locale | null>(null);
  const lastSyncedThemeRef = useRef<string | null>(null);

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
      lastSyncedLocaleRef.current = null;
      return;
    }

    if (lastSyncedLocaleRef.current === nextLocale) {
      return;
    }

    // Passive runtime sync should not refresh the current route. Persist the
    // preferred locale for the next server navigation and keep explicit locale
    // changes (for example from /account) as the only source of router.refresh().
    persistLocaleCookie(nextLocale);
    lastSyncedLocaleRef.current = nextLocale;
  }, [hasAuthenticatedSession, locale, nextLocale]);

  useEffect(() => {
    if (!hasAuthenticatedSession || !nextTheme) {
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
  }, [hasAuthenticatedSession, nextTheme, setTheme, theme]);

  if (!hasAuthenticatedSession) {
    return true;
  }
  /**
   * This hook should never globally block the authenticated shell.
   *
   * The protected route layout hydrates the profile query server-side, and even
   * if hydration is missing/late, the app should still render using defaults.
   * Preferences will be applied as soon as the query becomes available.
   */
  void profileQuery;
  return true;
};
