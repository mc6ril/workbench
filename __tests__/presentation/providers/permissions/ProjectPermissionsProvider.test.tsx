import type { PropsWithChildren } from "react";
import { renderHook } from "@testing-library/react";

import { ProjectRole } from "@/domains/project/core/domain/project.types";
import {
  ProjectPermissionsProvider,
  useProjectPermissions,
} from "@/domains/project/presentation/providers/permissions";
import { ProjectShellSnapshotProvider } from "@/domains/project/presentation/providers/ProjectShellSnapshotProvider";

const PROJECT_ID = "123e4567-e89b-12d3-a456-426614174000";

const makeWrapper = (role: ProjectRole | null) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ProjectShellSnapshotProvider
      snapshot={{
        projectId: PROJECT_ID,
        enabledModules: [],
        isRecipesBoardVisible: false,
        role,
      }}
    >
      <ProjectPermissionsProvider>{children}</ProjectPermissionsProvider>
    </ProjectShellSnapshotProvider>
  );

  Wrapper.displayName = "ProjectPermissionsTestWrapper";

  return Wrapper;
};

describe("ProjectPermissionsProvider", () => {
  it("exposes permission flags from current role", () => {
    const { result } = renderHook(() => useProjectPermissions(), {
      wrapper: makeWrapper(ProjectRole.ADMIN),
    });

    expect(result.current.role).toBe(ProjectRole.ADMIN);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canEditProject).toBe(true);
    expect(result.current.canDeleteProject).toBe(true);
    expect(result.current.canManageMembers).toBe(true);
    expect(result.current.canComment).toBe(true);
  });

  it("throws when hook is used outside provider", () => {
    expect(() => renderHook(() => useProjectPermissions())).toThrow(
      "useProjectPermissions must be used within ProjectPermissionsProvider"
    );
  });
});
