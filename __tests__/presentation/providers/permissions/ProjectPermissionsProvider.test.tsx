import type { PropsWithChildren } from "react";
import { renderHook } from "@testing-library/react";

import { useProjectRole } from "@/domains/project/presentation/hooks/member/useProjectRole";
import {
  ProjectPermissionsProvider,
  useProjectPermissions,
} from "@/domains/project/presentation/providers/permissions";
import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

jest.mock("@/domains/project/presentation/hooks/member/useProjectRole", () => ({
  useProjectRole: jest.fn(),
}));

const PROJECT_ID = "123e4567-e89b-12d3-a456-426614174000";

describe("ProjectPermissionsProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exposes permission flags from current role", () => {
    jest.mocked(useProjectRole).mockReturnValue({
      data: ProjectRole.ADMIN,
      isLoading: false,
    } as ReturnType<typeof useProjectRole>);

    const wrapper = ({ children }: PropsWithChildren) => {
      return (
        <ProjectPermissionsProvider projectId={PROJECT_ID}>
          {children}
        </ProjectPermissionsProvider>
      );
    };

    const { result } = renderHook(() => useProjectPermissions(), { wrapper });

    expect(result.current.role).toBe(ProjectRole.ADMIN);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canEditProject).toBe(true);
    expect(result.current.canManageMembers).toBe(true);
    expect(result.current.canComment).toBe(true);
  });

  it("throws when hook is used outside provider", () => {
    expect(() => renderHook(() => useProjectPermissions())).toThrow(
      "useProjectPermissions must be used within ProjectPermissionsProvider"
    );
  });
});
