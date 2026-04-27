"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";

import type { CurrentSession } from "@/domains/session/core/domain/session.types";

type SessionContextValue = {
  session: CurrentSession | null;
};

type SessionProviderProps = PropsWithChildren<{
  initialSession?: CurrentSession | null;
}>;

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({
  children,
  initialSession = null,
}: SessionProviderProps) => {
  const value = useMemo<SessionContextValue>(
    () => ({ session: initialSession }),
    [initialSession]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSessionContext = (): SessionContextValue => {
  const value = useContext(SessionContext);

  return value ?? { session: null };
};
