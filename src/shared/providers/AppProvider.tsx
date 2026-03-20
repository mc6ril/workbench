"use client";

import { type PropsWithChildren, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

import Toast from "@/shared/design-system/toast";
import { registerLocaleGetter } from "@/shared/i18n/config";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";
import { markNavigationSettled } from "@/shared/navigationPerf";
import { useLocaleSync } from "@/shared/utils/hooks/useLocaleSync";
import { useThemeSync } from "@/shared/utils/hooks/useThemeSync";

import ReactQueryProvider from "./ReactQueryProvider";

type Props = PropsWithChildren;

const NavigationPerfTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    markNavigationSettled(pathname);
  }, [pathname]);

  return null;
};

/**
 * Syncs locale from the current profile preferences into the Zustand store.
 * Also registers the locale getter once so the i18n system reads from Zustand.
 * Must be a child of ReactQueryProvider so profile queries are available.
 */
const LocaleSyncProvider = ({ children }: Props) => {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!registeredRef.current) {
      registerLocaleGetter(() => useLocaleStore.getState().locale);
      registeredRef.current = true;
    }
  }, []);

  useLocaleSync();
  return <>{children}</>;
};

/**
 * Syncs theme from the current profile preferences into next-themes.
 * Must be a child of both ReactQueryProvider and ThemeProvider so profile queries can run.
 */
const ThemeSyncProvider = ({ children }: Props) => {
  useThemeSync();
  return <>{children}</>;
};

/**
 * Central place for global providers.
 * Keep this file free of business logic and side effects.
 */
const AppProvider = ({ children }: Props) => {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <ReactQueryProvider>
        <LocaleSyncProvider>
          <ThemeSyncProvider>
            <NavigationPerfTracker />
            {children}
            <Toast />
          </ThemeSyncProvider>
        </LocaleSyncProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
