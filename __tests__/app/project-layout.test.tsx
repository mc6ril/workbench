import { render, screen } from "@testing-library/react";

import { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import { getProjectShellSnapshot } from "@/domains/project/infrastructure/server/getProjectShellSnapshot";
import ProjectRouteLayoutContent from "@/domains/project/presentation/layouts/projectRoute/ProjectRouteLayoutContent";
import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock(
  "@/domains/project/infrastructure/server/getProjectShellSnapshot",
  () => ({
    getProjectShellSnapshot: jest.fn(),
  })
);

jest.mock(
  "@/domains/project/presentation/layouts/projectShell/ProjectShell",
  () => ({
    __esModule: true,
    default: jest.fn(({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    )),
  })
);

describe("ProjectLayout", () => {
  const PROJECT_ID = "62353928-f54a-43da-bb64-9be9c562413a";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getProjectShellSnapshot).mockResolvedValue({
      projectId: PROJECT_ID,
      enabledModules: [ProjectModuleKey.RECIPES],
      isRecipesBoardVisible: true,
      role: null,
    });
  });

  it("resolves shell snapshot and passes it to ProjectShell", async () => {
    const result = await ProjectRouteLayoutContent({
      children: <div>Project content</div>,
      projectId: PROJECT_ID,
    });

    render(result);

    expect(screen.getByText("Project content")).toBeInTheDocument();
    expect(getProjectShellSnapshot).toHaveBeenCalledWith(PROJECT_ID);
    expect(jest.mocked(ProjectShell)).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: PROJECT_ID,
        shellSnapshot: {
          projectId: PROJECT_ID,
          enabledModules: [ProjectModuleKey.RECIPES],
          isRecipesBoardVisible: true,
          role: null,
        },
      }),
      undefined
    );
  });
});
