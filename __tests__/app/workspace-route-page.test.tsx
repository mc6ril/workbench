import { cookies, headers } from "next/headers";
import { render, screen } from "@testing-library/react";

import { localeCookieName } from "@/shared/i18n";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import WorkspaceRoutePage, {
  generateMetadata as generateWorkspaceMetadata,
} from "@/app/(protected)/workspace/page";
import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
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
  headers: jest.fn(),
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

jest.mock(
  "@/domains/workspace/core/usecases/project/listProjectsWithStats",
  () => ({
    listProjectsWithStats: jest.fn(),
  })
);

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
  const mockCookieStore = {
    get: jest.fn(),
  };
  const mockHeaderStore = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dehydrateMock.mockReturnValue({ workspace: true });

    mockQueryClient.prefetchQuery.mockReset();
    mockQueryClient.prefetchQuery.mockImplementation(async ({ queryFn }) => {
      return queryFn();
    });

    jest.mocked(createAppQueryClient).mockReturnValue(mockQueryClient as never);
    jest
      .mocked(createSupabaseServerClient)
      .mockResolvedValue(mockSupabaseClient as never);
    jest
      .mocked(createWorkspaceProjectCatalogGateway)
      .mockReturnValue(mockWorkspaceGateway as never);
    jest.mocked(cookies).mockResolvedValue(mockCookieStore as never);
    jest.mocked(headers).mockResolvedValue(mockHeaderStore as never);
    jest.mocked(listProjectsWithStats).mockResolvedValue([]);
    mockCookieStore.get.mockReturnValue(undefined);
    mockHeaderStore.get.mockReturnValue(null);
  });

  it("prefetches workspace queries and renders hydrated content", async () => {
    const result = await WorkspaceRoutePage();

    render(result);

    expect(screen.getByText("Workspace content")).toBeInTheDocument();
    expect(mockQueryClient.prefetchQuery).toHaveBeenNthCalledWith(1, {
      queryKey: workspaceQueryKeys.projects.withStats(),
      queryFn: expect.any(Function),
    });
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledTimes(1);
    expect(listProjectsWithStats).toHaveBeenCalledWith(mockWorkspaceGateway);
    expect(dehydrateMock).toHaveBeenCalledWith(mockQueryClient);
  });

  it("exposes translated metadata for the workspace page", async () => {
    mockCookieStore.get.mockImplementation((key: string) => {
      return key === localeCookieName ? { value: "en" } : undefined;
    });

    const metadata = await generateWorkspaceMetadata();

    expect(metadata.title).toBe("Family spaces");
    expect(metadata.description).toBe(
      "Create a workspace or join those you have access to."
    );
  });
});
