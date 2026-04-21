"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";

import { assertDefined } from "@/shared/errors/programmingError";

import type { ProjectShellSnapshot } from "@/domains/project/core/domain/projectShell.types";

type ProjectShellSnapshotContextValue = ProjectShellSnapshot;

const ProjectShellSnapshotContext =
  createContext<ProjectShellSnapshotContextValue | null>(null);

type ProjectShellSnapshotProviderProps = PropsWithChildren<{
  snapshot: ProjectShellSnapshot;
}>;

export const ProjectShellSnapshotProvider = ({
  snapshot,
  children,
}: ProjectShellSnapshotProviderProps) => {
  const value = useMemo((): ProjectShellSnapshotContextValue => {
    return snapshot;
  }, [snapshot]);

  return (
    <ProjectShellSnapshotContext.Provider value={value}>
      {children}
    </ProjectShellSnapshotContext.Provider>
  );
};

export const useProjectShellSnapshot = (): ProjectShellSnapshot => {
  const context = useContext(ProjectShellSnapshotContext);

  assertDefined(
    context,
    "useProjectShellSnapshot must be used within ProjectShellSnapshotProvider"
  );

  return context;
};
