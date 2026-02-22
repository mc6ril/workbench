"use client";

import { type PropsWithChildren, useEffect, useRef } from "react";
import { ThemeProvider } from "next-themes";

import Toast from "@/presentation/components/ui/Toast";
import { useLocaleSync } from "@/presentation/hooks/useLocaleSync";
import { useThemeSync } from "@/presentation/hooks/useThemeSync";
import ReactQueryProvider from "@/presentation/providers/ReactQueryProvider";
import { useLocaleStore } from "@/presentation/stores/useLocaleStore";

import { registerLocaleGetter } from "@/shared/i18n/config";

type Props = PropsWithChildren;

/**
 * Syncs locale from session preferences into the Zustand store.
 * Also registers the locale getter once so the i18n system reads from Zustand.
 * Must be a child of ReactQueryProvider so useSession is available.
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
 * Syncs theme from session preferences into next-themes.
 * Must be a child of both ReactQueryProvider and ThemeProvider.
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
            {children}
            <Toast />
          </ThemeSyncProvider>
        </LocaleSyncProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
