"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

import Loader from "@/shared/design-system/loader";
import Toast from "@/shared/design-system/toast";
import { markNavigationSettled } from "@/shared/navigationPerf";

import AppErrorBoundary from "./AppErrorBoundary";
import ReactQueryProvider from "./ReactQueryProvider";

import { useProfileRuntimeSync } from "@/domains/profile/presentation/providers/useProfileRuntimeSync";

type AppProviderProps = {
  children: React.ReactNode;
};

const NavigationPerfTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    markNavigationSettled(pathname);
  }, [pathname]);

  return null;
};

const RuntimeSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const isRuntimeReady = useProfileRuntimeSync();

  if (!isRuntimeReady) {
    return <Loader variant="full-page" />;
  }

  return <>{children}</>;
};

/**
 * Central place for global providers.
 * Keep this file free of business logic and side effects.
 */
const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <AppErrorBoundary>
        <ReactQueryProvider>
          <RuntimeSyncProvider>
            <NavigationPerfTracker />
            {children}
            <Toast />
          </RuntimeSyncProvider>
        </ReactQueryProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  );
};

export default AppProvider;
