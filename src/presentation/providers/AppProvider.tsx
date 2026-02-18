"use client";

import type { PropsWithChildren } from "react";

import { useLocaleSync } from "@/presentation/hooks/useLocaleSync";
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
 * Central place for global providers.
 * Keep this file free of business logic and side effects.
 */
const AppProvider = ({ children }: Props) => {
  return (
    <ReactQueryProvider>
      <LocaleSyncProvider>{children}</LocaleSyncProvider>
    </ReactQueryProvider>
  );
};

export default AppProvider;
