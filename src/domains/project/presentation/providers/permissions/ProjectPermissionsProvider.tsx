"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";

import { assertDefined } from "@/shared/errors/programmingError";

import { resolveProjectPermissions } from "@/domains/project/presentation/providers/permissions/resolveProjectPermissions";
import type { ProjectPermissions } from "@/domains/project/presentation/providers/permissions/types";
import { useProjectShellSnapshot } from "@/domains/project/presentation/providers/ProjectShellSnapshotProvider";

const ProjectPermissionsContext = createContext<ProjectPermissions | undefined>(
  undefined
);

export const ProjectPermissionsProvider = ({ children }: PropsWithChildren) => {
  const { role } = useProjectShellSnapshot();

  const value = useMemo<ProjectPermissions>(
    () => ({ ...resolveProjectPermissions(role), role }),
    [role]
  );

  return (
    <ProjectPermissionsContext.Provider value={value}>
      {children}
    </ProjectPermissionsContext.Provider>
  );
};

export const useProjectPermissions = (): ProjectPermissions => {
  const context = useContext(ProjectPermissionsContext);

  assertDefined(
    context,
    "useProjectPermissions must be used within ProjectPermissionsProvider"
  );

  return context;
};
