"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type BreadcrumbState = {
  childLabel: string | null;
};

type BreadcrumbContextValue = BreadcrumbState & {
  setChildLabel: (label: string | null) => void;
};

const ToolbarBreadcrumbContext = createContext<BreadcrumbContextValue | null>(
  null
);

export const ToolbarBreadcrumbProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [childLabel, setChildLabel] = useState<string | null>(null);

  const set = useCallback((label: string | null) => {
    setChildLabel(label);
  }, []);

  return (
    <ToolbarBreadcrumbContext.Provider
      value={{ childLabel, setChildLabel: set }}
    >
      {children}
    </ToolbarBreadcrumbContext.Provider>
  );
};

export const useToolbarBreadcrumb = (): BreadcrumbState => {
  const ctx = useContext(ToolbarBreadcrumbContext);
  if (!ctx)
    throw new Error(
      "useToolbarBreadcrumb must be used inside ToolbarBreadcrumbProvider"
    );
  return { childLabel: ctx.childLabel };
};

export const useRegisterToolbarBreadcrumb = (label: string | null): void => {
  const ctx = useContext(ToolbarBreadcrumbContext);
  if (!ctx)
    throw new Error(
      "useRegisterToolbarBreadcrumb must be used inside ToolbarBreadcrumbProvider"
    );

  const { setChildLabel } = ctx;

  useEffect(() => {
    setChildLabel(label);
    return () => setChildLabel(null);
  }, [label, setChildLabel]);
};
