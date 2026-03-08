"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";

import { useProjectRole } from "@/presentation/hooks/member/useProjectRole";
import { resolveProjectPermissions } from "@/presentation/providers/permissions/resolveProjectPermissions";
import type { ProjectPermissions } from "@/presentation/providers/permissions/types";

type ProjectPermissionsProviderProps = PropsWithChildren<{
  projectId: string;
}>;

const ProjectPermissionsContext = createContext<ProjectPermissions | undefined>(
  undefined
);

export const ProjectPermissionsProvider = ({
  projectId,
  children,
}: ProjectPermissionsProviderProps) => {
  const { data: role = null, isLoading } = useProjectRole(projectId);

  const value = useMemo<ProjectPermissions>(() => {
    return {
      ...resolveProjectPermissions(role),
      role,
      isLoading,
    };
  }, [isLoading, role]);

  return (
    <ProjectPermissionsContext.Provider value={value}>
      {children}
    </ProjectPermissionsContext.Provider>
  );
};

export const useProjectPermissions = (): ProjectPermissions => {
  const context = useContext(ProjectPermissionsContext);

  if (!context) {
    throw new Error(
      "useProjectPermissions must be used within ProjectPermissionsProvider"
    );
  }

  return context;
};
