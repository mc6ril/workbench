import { render, screen } from "@testing-library/react";

import ProjectLayout from "@/app/(protected)/[projectId]/layout";
import { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import { getProjectShellSnapshot } from "@/domains/project/infrastructure/server/getProjectShellSnapshot";
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
  "@/modules/board/presentation/projectShell/boardShellAdapter",
  () => ({
    __esModule: true,
    default: ({ projectId }: { projectId: string }) => (
      <div data-testid="board-shell-adapter">{projectId}</div>
    ),
  })
);

jest.mock(
  "@/modules/recipes/presentation/projectShell/recipesShellAdapter",
  () => ({
    __esModule: true,
    default: ({ projectId }: { projectId: string }) => (
      <div data-testid="recipes-shell-adapter">{projectId}</div>
    ),
  })
);

jest.mock(
  "@/domains/project/presentation/layouts/projectShell/ProjectShell",
  () => ({
    __esModule: true,
    default: jest.fn(
      ({
        children,
        shellAdapter,
      }: {
        children: React.ReactNode;
        shellAdapter?: React.ReactNode;
      }) => (
        <>
          {shellAdapter}
          {children}
        </>
      )
    ),
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
    });
  });

  it("resolves shell snapshot and renders project shell without hydrating legacy layout queries", async () => {
    const result = await ProjectLayout({
      children: <div>Project content</div>,
      params: Promise.resolve({ projectId: PROJECT_ID }),
    });

    render(result);

    expect(screen.getByTestId("board-shell-adapter")).toHaveTextContent(
      PROJECT_ID
    );
    expect(screen.getByTestId("recipes-shell-adapter")).toHaveTextContent(
      PROJECT_ID
    );
    expect(screen.getByText("Project content")).toBeInTheDocument();
    expect(getProjectShellSnapshot).toHaveBeenCalledWith(PROJECT_ID);
    expect(jest.mocked(ProjectShell)).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: PROJECT_ID,
        shellSnapshot: {
          projectId: PROJECT_ID,
          enabledModules: [ProjectModuleKey.RECIPES],
          isRecipesBoardVisible: true,
        },
      }),
      undefined
    );
  });
});
