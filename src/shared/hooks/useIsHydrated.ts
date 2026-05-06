"use client";

import { useSyncExternalStore } from "react";

const subscribeToHydration = (): (() => void) => {
  return () => {};
};

export const useIsHydrated = (): boolean => {
  return useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
};
