import { cookies, headers } from "next/headers";
import { render, screen } from "@testing-library/react";

import { localeCookieName } from "@/shared/i18n";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import { loadWorkspaceRouteData } from "@/app/(protected)/workspace/loadWorkspaceRouteData";
import WorkspaceRoutePage, {
  generateMetadata as generateWorkspaceMetadata,
} from "@/app/(protected)/workspace/page";
import { getProfile } from "@/domains/profile/core/usecases/getProfile";
import { createProfileGateway } from "@/domains/profile/infrastructure/profileGateway.supabase";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";
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

jest.mock("@/domains/session/core/usecases/getCurrentSession", () => ({
  getCurrentSession: jest.fn(),
}));

jest.mock("@/domains/session/infrastructure/supabase/repositories", () => ({
  createSessionGateway: jest.fn(),
}));

jest.mock("@/domains/profile/core/usecases/getProfile", () => ({
  getProfile: jest.fn(),
}));

jest.mock("@/domains/profile/infrastructure/profileGateway.supabase", () => ({
  createProfileGateway: jest.fn(),
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
  const mockSessionGateway = { tag: "sessionGateway" };
  const mockProfileGateway = { tag: "profileGateway" };
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
      .mocked(createSessionGateway)
      .mockReturnValue(mockSessionGateway as never);
    jest
      .mocked(createProfileGateway)
      .mockReturnValue(mockProfileGateway as never);
    jest
      .mocked(createWorkspaceProjectCatalogGateway)
      .mockReturnValue(mockWorkspaceGateway as never);
    jest.mocked(cookies).mockResolvedValue(mockCookieStore as never);
    jest.mocked(headers).mockResolvedValue(mockHeaderStore as never);
    jest.mocked(getCurrentSession).mockResolvedValue({
      userId: "user-1",
      loginEmail: "cyril@example.com",
      accessToken: "",
      isSuperuser: false,
    } as never);
    jest.mocked(getProfile).mockResolvedValue({
      displayName: "Cyril Lesot",
    } as never);
    jest.mocked(listProjectsWithStats).mockResolvedValue([]);
    mockCookieStore.get.mockReturnValue(undefined);
    mockHeaderStore.get.mockReturnValue(null);
  });

  it("renders workspace route content", async () => {
    const result = await WorkspaceRoutePage();

    render(result);

    expect(screen.getByText("Workspace content")).toBeInTheDocument();
  });

  it("prefetches workspace queries in the layout loader", async () => {
    const result = await loadWorkspaceRouteData();

    expect(result.displayName).toBe("Cyril Lesot");
    expect(typeof result.referenceTimeIso).toBe("string");
    expect(mockQueryClient.prefetchQuery).toHaveBeenNthCalledWith(1, {
      queryKey: workspaceQueryKeys.projects.withStats(),
      queryFn: expect.any(Function),
    });
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledTimes(1);
    expect(createSessionGateway).toHaveBeenCalledWith(mockSupabaseClient);
    expect(createProfileGateway).toHaveBeenCalledWith(mockSupabaseClient);
    expect(getCurrentSession).toHaveBeenCalledWith(mockSessionGateway);
    expect(getProfile).toHaveBeenCalledWith(mockProfileGateway, "user-1");
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
