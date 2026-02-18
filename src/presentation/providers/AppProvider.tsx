"use client";

import type { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";

import { useLocaleSync } from "@/presentation/hooks/useLocaleSync";
import { useThemeSync } from "@/presentation/hooks/useThemeSync";
import ReactQueryProvider from "@/presentation/providers/ReactQueryProvider";

type Props = PropsWithChildren;

/**
 * Syncs locale from session preferences into the Zustand store.
 * Must be a child of ReactQueryProvider so useSession is available.
 */
const LocaleSyncProvider = ({ children }: Props) => {
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
          <ThemeSyncProvider>{children}</ThemeSyncProvider>
        </LocaleSyncProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
