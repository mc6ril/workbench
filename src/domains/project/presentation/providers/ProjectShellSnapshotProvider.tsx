"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { assertDefined } from "@/shared/errors/programmingError";

import type { ProjectShellSnapshot } from "@/domains/project/core/domain/projectShell.types";

type ProjectShellSnapshotContextValue = {
  snapshot: ProjectShellSnapshot;
  setSnapshot: (snapshot: ProjectShellSnapshot) => void;
  updateEnabledModules: (
    enabledModules: ProjectShellSnapshot["enabledModules"]
  ) => void;
};

const ProjectShellSnapshotContext =
  createContext<ProjectShellSnapshotContextValue | null>(null);

type ProjectShellSnapshotProviderProps = PropsWithChildren<{
  snapshot: ProjectShellSnapshot;
}>;

export const ProjectShellSnapshotProvider = ({
  snapshot,
  children,
}: ProjectShellSnapshotProviderProps) => {
  const [currentSnapshot, setCurrentSnapshot] = useState(snapshot);

  const setSnapshot = useCallback((nextSnapshot: ProjectShellSnapshot) => {
    setCurrentSnapshot(nextSnapshot);
  }, []);

  const updateEnabledModules = useCallback(
    (enabledModules: ProjectShellSnapshot["enabledModules"]) => {
      setCurrentSnapshot((prev) => ({
        ...prev,
        enabledModules,
      }));
    },
    []
  );

  const value = useMemo((): ProjectShellSnapshotContextValue => {
    return {
      snapshot: currentSnapshot,
      setSnapshot,
      updateEnabledModules,
    };
  }, [currentSnapshot, setSnapshot, updateEnabledModules]);

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

  return context.snapshot;
};

export const useProjectShellSnapshotActions = (): Pick<
  ProjectShellSnapshotContextValue,
  "setSnapshot" | "updateEnabledModules"
> => {
  const context = useContext(ProjectShellSnapshotContext);

  assertDefined(
    context,
    "useProjectShellSnapshotActions must be used within ProjectShellSnapshotProvider"
  );

  return {
    setSnapshot: context.setSnapshot,
    updateEnabledModules: context.updateEnabledModules,
  };
};
