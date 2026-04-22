"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import type { DehydratedState } from "@tanstack/react-query";

import Toast from "@/shared/design-system/toast";
import { markNavigationSettled } from "@/shared/navigationPerf";

import AppErrorBoundary from "./AppErrorBoundary";
import ReactQueryProvider from "./ReactQueryProvider";

import { useProfileRuntimeSync } from "@/domains/profile/presentation/providers/useProfileRuntimeSync";

type AppProviderProps = {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
};

const NavigationPerfTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    markNavigationSettled(pathname);
  }, [pathname]);

  return null;
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
          <NavigationPerfTracker />
          {children}
          <Toast />
        </ReactQueryProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  );
};

export default AppProvider;
