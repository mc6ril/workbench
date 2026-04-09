import { render, screen } from "@testing-library/react";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import ProjectLayout from "@/app/(protected)/[projectId]/layout";
import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { getUserSubscription } from "@/domains/billing/core/usecases/getUserSubscription";
import { createBillingVisibilityPort } from "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase";
import { createSubscriptionRepository } from "@/domains/billing/infrastructure/supabase/repositories";
import { getCurrentProjectRole } from "@/domains/project/core/usecases/member/getCurrentProjectRole";
import { listProjectMembers } from "@/domains/project/core/usecases/member/listProjectMembers";
import { getProjectForRoute } from "@/domains/project/infrastructure/server/getProjectForRoute";
import { createProjectMemberGateway } from "@/domains/project/infrastructure/supabase/gateways";
import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";
import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";
import { createRuntimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/RuntimeConfigPort.supabase";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  dehydrate: jest.fn(() => ({ dehydrated: true })),
  HydrationBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/shared/infrastructure/supabase/client-server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("@/shared/providers/queryClient", () => ({
  createAppQueryClient: jest.fn(),
}));

jest.mock("@/shared/utils/nextErrors", () => ({
  isDynamicServerUsageError: jest.fn(() => false),
}));

jest.mock("@/domains/billing/core/usecases/getBillingVisibility", () => ({
  getBillingVisibility: jest.fn(),
}));

jest.mock("@/domains/billing/core/usecases/getUserSubscription", () => ({
  getUserSubscription: jest.fn(),
}));

jest.mock(
  "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase",
  () => ({
    createBillingVisibilityPort: jest.fn(),
  })
);

jest.mock("@/domains/billing/infrastructure/supabase/repositories", () => ({
  createSubscriptionRepository: jest.fn(),
}));

jest.mock("@/domains/project/core/usecases/member/getCurrentProjectRole", () => ({
  getCurrentProjectRole: jest.fn(),
}));

jest.mock("@/domains/project/core/usecases/member/listProjectMembers", () => ({
  listProjectMembers: jest.fn(),
}));

jest.mock("@/domains/project/infrastructure/server/getProjectForRoute", () => ({
  getProjectForRoute: jest.fn(),
}));

jest.mock("@/domains/project/infrastructure/supabase/gateways", () => ({
  createProjectMemberGateway: jest.fn(),
}));

jest.mock("@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean", () => ({
  getRuntimeConfigBoolean: jest.fn(),
}));

jest.mock(
  "@/domains/runtimeConfig/infrastructure/supabase/RuntimeConfigPort.supabase",
  () => ({
    createRuntimeConfigPort: jest.fn(),
  })
);

jest.mock("@/domains/session/core/usecases/getCurrentSession", () => ({
  getCurrentSession: jest.fn(),
}));

jest.mock("@/domains/session/infrastructure/supabase/repositories", () => ({
  createSessionGateway: jest.fn(),
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
      <div>
        <div data-testid="shell-adapter">{shellAdapter}</div>
        <div data-testid="project-children">{children}</div>
      </div>
    )
  ),
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

describe("ProjectLayout", () => {
  const mockQueryClient = {
    prefetchQuery: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockQueryClient.prefetchQuery.mockImplementation(async ({ queryFn }) => {
      return queryFn();
    });

    jest
      .mocked(createAppQueryClient)
      .mockReturnValue(mockQueryClient as never);
    jest
      .mocked(createSupabaseServerClient)
      .mockResolvedValue({ tag: "supabase" } as never);
    jest
      .mocked(createProjectMemberGateway)
      .mockReturnValue({ tag: "project-member-gateway" } as never);
    jest
      .mocked(createBillingVisibilityPort)
      .mockReturnValue({ tag: "billing-visibility-port" } as never);
    jest
      .mocked(createRuntimeConfigPort)
      .mockReturnValue({ tag: "runtime-config-port" } as never);
    jest
      .mocked(createSessionGateway)
      .mockReturnValue({ tag: "session-gateway" } as never);
    jest
      .mocked(createSubscriptionRepository)
      .mockReturnValue({ tag: "subscription-repository" } as never);

    jest.mocked(getProjectForRoute).mockResolvedValue({ id: "project-1" } as never);
    jest.mocked(getCurrentProjectRole).mockResolvedValue("owner" as never);
    jest.mocked(listProjectMembers).mockResolvedValue([] as never);
    jest.mocked(getBillingVisibility).mockResolvedValue(true);
    jest.mocked(getRuntimeConfigBoolean).mockResolvedValue(true);
    jest.mocked(getUserSubscription).mockResolvedValue(null as never);
    jest.mocked(getCurrentSession).mockResolvedValue({
      userId: "user-1",
      isSuperuser: false,
    } as never);
  });

  it("mounts both board and recipes shell adapters in the project shell", async () => {
    const result = await ProjectLayout({
      children: <div>Project content</div>,
      params: Promise.resolve({ projectId: "project-1" }),
    });

    render(result);

    expect(screen.getByTestId("board-shell-adapter")).toHaveTextContent(
      "project-1"
    );
    expect(screen.getByTestId("recipes-shell-adapter")).toHaveTextContent(
      "project-1"
    );

    const projectShellMock = jest.mocked(ProjectShell);
    expect(projectShellMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "project-1",
      }),
      undefined
    );
  });
});
