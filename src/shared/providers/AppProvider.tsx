"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

import Toast from "@/shared/design-system/toast";
import { registerLocaleGetter } from "@/shared/i18n/config";
import { LocaleProvider } from "@/shared/i18n/LocaleProvider";
import type { Locale } from "@/shared/i18n/types";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";
import { markNavigationSettled } from "@/shared/navigationPerf";

import ReactQueryProvider from "./ReactQueryProvider";

import { useLocaleSync } from "@/domains/profile/presentation/providers/useLocaleSync";
import { useThemeSync } from "@/domains/profile/presentation/providers/useThemeSync";

type AppProviderProps = {
  initialLocale: Locale;
  children: React.ReactNode;
};

const NavigationPerfTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    markNavigationSettled(pathname);
  }, [pathname]);

  return null;
};

/**
 * Syncs locale from the current profile preferences into the active locale
 * provider and keeps the shared locale getter aligned with the current value.
 * Must be a child of ReactQueryProvider so profile queries are available.
 */
const LocaleSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    registerLocaleGetter(() => locale);
  }, [locale]);

  useLocaleSync();
  return <>{children}</>;
};

/**
 * Syncs theme from the current profile preferences into next-themes.
 * Must be a child of both ReactQueryProvider and ThemeProvider so profile queries can run.
 */
const ThemeSyncProvider = ({ children }: { children: React.ReactNode }) => {
  useThemeSync();
  return <>{children}</>;
};

/**
 * Central place for global providers.
 * Keep this file free of business logic and side effects.
 */
const AppProvider = ({ children, initialLocale }: AppProviderProps) => {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <LocaleProvider key={initialLocale} initialLocale={initialLocale}>
        <ReactQueryProvider>
          <LocaleSyncProvider>
            <ThemeSyncProvider>
              <NavigationPerfTracker />
              {children}
              <Toast />
            </ThemeSyncProvider>
          </LocaleSyncProvider>
        </ReactQueryProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
