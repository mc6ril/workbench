"use client";

import { startTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { persistLocaleCookie } from "./config";
import type { Locale } from "./routing";

export const useLocalePreference = () => {
  const router = useRouter();
  const activeLocale = useLocale();

  return useCallback(
    (locale: Locale) => {
      if (locale === activeLocale) {
        return false;
      }

      persistLocaleCookie(locale);
      startTransition(() => {
        router.refresh();
      });

      return true;
    },
    [activeLocale, router]
  );
};
