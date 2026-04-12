import { cookies } from "next/headers";
import { render, screen } from "@testing-library/react";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import WorkspaceRoutePage from "@/app/(protected)/workspace/page";
import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { createBillingVisibilityPort } from "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase";
import { queryKeys as billingQueryKeys } from "@/domains/billing/presentation/hooks/queryKeys";
import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
import { listReclaimableProjects } from "@/domains/workspace/core/usecases/project/listReclaimableProjects";
import { createWorkspaceProjectCatalogGateway } from "@/domains/workspace/infrastructure/supabase/gateways";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

const dehydrateMock = jest.fn((_queryClient?: unknown) => ({
  workspace: true,
}));

jest.mock("@tanstack/react-query", () => ({
  HydrationBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  dehydrate: (queryClient: unknown) => dehydrateMock(queryClient),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/shared/providers/queryClient", () => ({
  createAppQueryClient: jest.fn(),
}));

jest.mock("@/shared/infrastructure/supabase/client-server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("@/domains/workspace/infrastructure/supabase/gateways", () => ({
  createWorkspaceProjectCatalogGateway: jest.fn(),
}));

jest.mock("@/domains/workspace/core/usecases/project/listProjectsWithStats", () => ({
  listProjectsWithStats: jest.fn(),
}));

jest.mock(
  "@/domains/workspace/core/usecases/project/listReclaimableProjects",
  () => ({
    listReclaimableProjects: jest.fn(),
  })
);

jest.mock(
  "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase",
  () => ({
    createBillingVisibilityPort: jest.fn(),
  })
);

jest.mock("@/domains/billing/core/usecases/getBillingVisibility", () => ({
  getBillingVisibility: jest.fn(),
}));

jest.mock("@/domains/workspace/presentation/pages/workspace", () => ({
  __esModule: true,
  default: () => <div>Workspace content</div>,
}));

describe("WorkspaceRoutePage hydration", () => {
  const mockQueryClient = {
    prefetchQuery: jest.fn(),
  };

  const mockSupabaseClient = { tag: "supabase" };
  const mockWorkspaceGateway = { tag: "workspaceGateway" };
  const mockBillingVisibilityPort = { tag: "billingVisibilityPort" };
  const mockCookieStore = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dehydrateMock.mockReturnValue({ workspace: true });

    mockQueryClient.prefetchQuery.mockReset();
    mockQueryClient.prefetchQuery.mockImplementation(async ({ queryFn }) => {
      return queryFn();
    });

    jest
      .mocked(createAppQueryClient)
      .mockReturnValue(mockQueryClient as never);
    jest
      .mocked(createSupabaseServerClient)
      .mockResolvedValue(mockSupabaseClient as never);
    jest
      .mocked(createWorkspaceProjectCatalogGateway)
      .mockReturnValue(mockWorkspaceGateway as never);
    jest
      .mocked(createBillingVisibilityPort)
      .mockReturnValue(mockBillingVisibilityPort as never);
    jest.mocked(cookies).mockResolvedValue(mockCookieStore as never);
    jest.mocked(listProjectsWithStats).mockResolvedValue([]);
    jest.mocked(listReclaimableProjects).mockResolvedValue([]);
    jest.mocked(getBillingVisibility).mockResolvedValue(false);
    mockCookieStore.get.mockReturnValue(undefined);
  });

  it("prefetches workspace queries and renders hydrated content", async () => {
    const result = await WorkspaceRoutePage();

    render(result);

    expect(screen.getByText("Workspace content")).toBeInTheDocument();
    expect(mockQueryClient.prefetchQuery).toHaveBeenNthCalledWith(1, {
      queryKey: workspaceQueryKeys.projects.withStats(),
      queryFn: expect.any(Function),
    });
    expect(mockQueryClient.prefetchQuery).toHaveBeenNthCalledWith(2, {
      queryKey: workspaceQueryKeys.projects.reclaimable(),
      queryFn: expect.any(Function),
    });
    expect(mockQueryClient.prefetchQuery).toHaveBeenNthCalledWith(3, {
      queryKey: billingQueryKeys.config.billingVisibility("standard"),
      queryFn: expect.any(Function),
    });
    expect(listProjectsWithStats).toHaveBeenCalledWith(mockWorkspaceGateway);
    expect(listReclaimableProjects).toHaveBeenCalledWith(mockWorkspaceGateway);
    expect(getBillingVisibility).toHaveBeenCalledWith(
      mockBillingVisibilityPort,
      {
        overrideValue: undefined,
      }
    );
    expect(dehydrateMock).toHaveBeenCalledWith(mockQueryClient);
  });
});
