"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

import Loader from "@/shared/design-system/loader";
import Toast from "@/shared/design-system/toast";
import { registerLocaleGetter } from "@/shared/i18n/config";
import { LocaleProvider } from "@/shared/i18n/LocaleProvider";
import type { Locale } from "@/shared/i18n/types";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";
import { markNavigationSettled } from "@/shared/navigationPerf";

import AppErrorBoundary from "./AppErrorBoundary";
import ReactQueryProvider from "./ReactQueryProvider";

import { useProfileRuntimeSync } from "@/domains/profile/presentation/providers/useProfileRuntimeSync";

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

const RuntimeSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const locale = useLocaleStore((state) => state.locale);
  const isRuntimeReady = useProfileRuntimeSync();

  useEffect(() => {
    registerLocaleGetter(() => locale);
  }, [locale]);

  if (!isRuntimeReady) {
    return <Loader variant="full-page" />;
  }

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
        <AppErrorBoundary>
          <ReactQueryProvider>
            <RuntimeSyncProvider>
              <NavigationPerfTracker />
              {children}
              <Toast />
            </RuntimeSyncProvider>
          </ReactQueryProvider>
        </AppErrorBoundary>
      </LocaleProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
