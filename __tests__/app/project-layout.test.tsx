import { render, screen } from "@testing-library/react";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import ProjectLayout from "@/app/(protected)/[projectId]/layout";
import { getCurrentProjectRole } from "@/domains/project/core/usecases/member/getCurrentProjectRole";
import { listProjectMembers } from "@/domains/project/core/usecases/member/listProjectMembers";
import { getProjectForRoute } from "@/domains/project/infrastructure/server/getProjectForRoute";
import { createProjectMemberGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys as projectQueryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";

const dehydrateMock = jest.fn((_queryClient?: unknown) => ({
  dehydrated: true,
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  HydrationBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  dehydrate: (queryClient: unknown) => dehydrateMock(queryClient),
}));

jest.mock("@/shared/providers/queryClient", () => ({
  createAppQueryClient: jest.fn(),
}));

jest.mock("@/shared/infrastructure/supabase/client-server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("@/domains/project/infrastructure/server/getProjectForRoute", () => ({
  getProjectForRoute: jest.fn(),
}));

jest.mock("@/domains/project/infrastructure/supabase/gateways", () => ({
  createProjectMemberGateway: jest.fn(),
}));

jest.mock("@/domains/project/core/usecases/member/getCurrentProjectRole", () => ({
  getCurrentProjectRole: jest.fn(),
}));

jest.mock("@/domains/project/core/usecases/member/listProjectMembers", () => ({
  listProjectMembers: jest.fn(),
}));

jest.mock("@/modules/board/presentation/projectShell/boardShellAdapter", () => ({
  __esModule: true,
  default: ({ projectId }: { projectId: string }) => (
    <div data-testid="board-shell-adapter">{projectId}</div>
  ),
}));

jest.mock("@/modules/recipes/presentation/projectShell/recipesShellAdapter", () => ({
  __esModule: true,
  default: ({ projectId }: { projectId: string }) => (
    <div data-testid="recipes-shell-adapter">{projectId}</div>
  ),
}));

jest.mock("@/domains/project/presentation/layouts/projectShell/ProjectShell", () => ({
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
}));

describe("ProjectLayout hydration", () => {
  const PROJECT_ID = "62353928-f54a-43da-bb64-9be9c562413a";
  const mockQueryClient = {
    prefetchQuery: jest.fn(),
  };
  const mockSupabaseClient = { tag: "supabase" };
  const mockProjectMemberGateway = { tag: "projectMemberGateway" };

  beforeEach(() => {
    jest.clearAllMocks();
    dehydrateMock.mockReturnValue({ dehydrated: true });

    mockQueryClient.prefetchQuery.mockReset();
    mockQueryClient.prefetchQuery.mockImplementation(async ({ queryFn }) => {
      return queryFn();
    });

    jest.mocked(createAppQueryClient).mockReturnValue(mockQueryClient as never);
    jest
      .mocked(createSupabaseServerClient)
      .mockResolvedValue(mockSupabaseClient as never);
    jest.mocked(getProjectForRoute).mockResolvedValue({
      id: PROJECT_ID,
    } as never);
    jest
      .mocked(createProjectMemberGateway)
      .mockReturnValue(mockProjectMemberGateway as never);
    jest.mocked(getCurrentProjectRole).mockResolvedValue("admin" as never);
    jest.mocked(listProjectMembers).mockResolvedValue([] as never);
  });

  it("hydrates only the project role and members queries before rendering", async () => {
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
    expect(getProjectForRoute).toHaveBeenCalledWith(PROJECT_ID);
    expect(mockQueryClient.prefetchQuery).toHaveBeenNthCalledWith(1, {
      queryKey: projectQueryKeys.projects.currentRole(PROJECT_ID),
      queryFn: expect.any(Function),
    });
    expect(mockQueryClient.prefetchQuery).toHaveBeenNthCalledWith(2, {
      queryKey: projectQueryKeys.members.byProject(PROJECT_ID),
      queryFn: expect.any(Function),
    });
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledTimes(2);
    expect(getCurrentProjectRole).toHaveBeenCalledWith(
      mockProjectMemberGateway,
      PROJECT_ID
    );
    expect(listProjectMembers).toHaveBeenCalledWith(
      mockProjectMemberGateway,
      PROJECT_ID
    );
    expect(dehydrateMock).toHaveBeenCalledWith(mockQueryClient);
    expect(jest.mocked(ProjectShell)).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: PROJECT_ID,
      }),
      undefined
    );
  });
});
