"use client";

import { useEffect } from "react";

import { defaultLocale, supportedLocales } from "@/shared/i18n/config";
import type { Locale } from "@/shared/i18n/types";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";
import { useCurrentUserProfile } from "@/shared/profile";

/**
 * Syncs the locale store with the user's language preference from the session.
 * Should be mounted once at the app root (e.g. in AppProvider).
 */
export const useLocaleSync = (): void => {
  const { data: profile } = useCurrentUserProfile();
  const setLocale = useLocaleStore((s) => s.setLocale);

  const profileLanguage = profile?.preferences?.language;

  useEffect(() => {
    if (!profileLanguage) {
      return;
    }

    const isSupported = supportedLocales.includes(profileLanguage as Locale);
    const nextLocale: Locale = isSupported
      ? (profileLanguage as Locale)
      : defaultLocale;

    setLocale(nextLocale);
  }, [profileLanguage, setLocale]);
};
