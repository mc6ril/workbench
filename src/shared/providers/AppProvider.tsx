"use client";

import { ThemeProvider } from "next-themes";
import type { DehydratedState } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Toast from "@/shared/design-system/toast";

import AppErrorBoundary from "./AppErrorBoundary";
import ReactQueryProvider from "./ReactQueryProvider";

import { useProfileRuntimeSync } from "@/domains/profile/presentation/providers/useProfileRuntimeSync";

type AppProviderProps = {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
};

/**
 * Applies hydrated profile preferences (locale, theme) without blocking the tree.
 */
const ProfilePreferencesSync = () => {
  useProfileRuntimeSync();
  return null;
};

/**
 * Central place for global providers.
 * Keep this file free of business logic and side effects.
 */
const AppProvider = ({ children, dehydratedState }: AppProviderProps) => {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <AppErrorBoundary>
        <ReactQueryProvider dehydratedState={dehydratedState}>
          <ProfilePreferencesSync />
          {children}
          <Toast />
          <Analytics />
          <SpeedInsights />
        </ReactQueryProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  );
};

export default AppProvider;
