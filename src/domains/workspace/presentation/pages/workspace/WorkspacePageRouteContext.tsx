"use client";

import { createContext, useContext } from "react";

type WorkspacePageRouteContextValue = {
  displayName?: string | null;
  referenceTimeIso: string;
};

const WorkspacePageRouteContext =
  createContext<WorkspacePageRouteContextValue | null>(null);

type WorkspacePageRouteProviderProps = {
  children: React.ReactNode;
  displayName?: string | null;
  referenceTimeIso: string;
};

export const WorkspacePageRouteProvider = ({
  children,
  displayName,
  referenceTimeIso,
}: WorkspacePageRouteProviderProps) => {
  return (
    <WorkspacePageRouteContext.Provider
      value={{ referenceTimeIso, displayName }}
    >
      {children}
    </WorkspacePageRouteContext.Provider>
  );
};

export const useWorkspaceRouteReferenceTimeIso = (): string | undefined => {
  return useContext(WorkspacePageRouteContext)?.referenceTimeIso;
};

export const useWorkspaceRouteDisplayName = (): string | null | undefined => {
  return useContext(WorkspacePageRouteContext)?.displayName;
};
