"use client";

import { useEffect } from "react";

import { useSession } from "@/domains/auth/presentation/hooks/useSession";

import { defaultLocale, supportedLocales } from "@/shared/i18n/config";
import type { Locale } from "@/shared/i18n/types";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";

/**
 * Syncs the locale store with the user's language preference from the session.
 * Should be mounted once at the app root (e.g. in AppProvider).
 */
export const useLocaleSync = (): void => {
  const { data: session } = useSession();
  const setLocale = useLocaleStore((s) => s.setLocale);

  const sessionLanguage = session?.preferences?.language;

  useEffect(() => {
    if (!sessionLanguage) {
      return;
    }

    const isSupported = supportedLocales.includes(sessionLanguage as Locale);
    const nextLocale: Locale = isSupported
      ? (sessionLanguage as Locale)
      : defaultLocale;

    setLocale(nextLocale);
  }, [sessionLanguage, setLocale]);
};
