"use client";

import { ThemeProvider } from "next-themes";
import type { DehydratedState } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Toast from "@/shared/design-system/toast";

import AppErrorBoundary from "./AppErrorBoundary";
import ReactQueryProvider from "./ReactQueryProvider";

import type { Theme } from "@/domains/profile/core/domain/profile.types";
import { useProfileRuntimeSync } from "@/domains/profile/presentation/providers/useProfileRuntimeSync";

type AppProviderProps = {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
  initialTheme?: Theme | null;
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
const AppProvider = ({
  children,
  dehydratedState,
  initialTheme,
}: AppProviderProps) => {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme={initialTheme ?? "system"}
      enableSystem
    >
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
