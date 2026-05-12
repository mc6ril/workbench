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
  renderActions: (() => ReactNode) | null;
};

type BreadcrumbContextValue = BreadcrumbState & {
  setChildLabel: (label: string | null) => void;
  setRenderActions: (fn: (() => ReactNode) | null) => void;
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
  const [renderActions, setRenderActionsState] = useState<
    (() => ReactNode) | null
  >(null);

  const set = useCallback((label: string | null) => {
    setChildLabel(label);
  }, []);

  // Wrap in arrow fn to prevent React from calling `fn` as a state initializer.
  const setRenderActions = useCallback((fn: (() => ReactNode) | null) => {
    setRenderActionsState(fn === null ? null : () => fn);
  }, []);

  return (
    <ToolbarBreadcrumbContext.Provider
      value={{
        childLabel,
        renderActions,
        setChildLabel: set,
        setRenderActions,
      }}
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
  return { childLabel: ctx.childLabel, renderActions: ctx.renderActions };
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

export const useRegisterToolbarActions = (
  fn: (() => ReactNode) | null
): void => {
  const ctx = useContext(ToolbarBreadcrumbContext);
  if (!ctx)
    throw new Error(
      "useRegisterToolbarActions must be used inside ToolbarBreadcrumbProvider"
    );

  const { setRenderActions } = ctx;

  useEffect(() => {
    setRenderActions(fn);
    return () => setRenderActions(null);
  }, [fn, setRenderActions]);
};
