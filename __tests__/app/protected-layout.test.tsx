import { render, screen } from "@testing-library/react";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import AppProvider from "@/shared/providers/AppProvider";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import ProtectedLayout from "@/app/(protected)/layout";
import { getProfile } from "@/domains/profile/core/usecases/getProfile";
import { createProfileGateway } from "@/domains/profile/infrastructure/profileGateway.supabase";
import { queryKeys as profileQueryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";
import { queryKeys as sessionQueryKeys } from "@/domains/session/presentation/hooks/queryKeys";

const dehydrateMock = jest.fn((_queryClient?: unknown) => ({
  dehydrated: true,
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  dehydrate: (queryClient: unknown) => dehydrateMock(queryClient),
}));

jest.mock("@/shared/providers/AppProvider", () => ({
  __esModule: true,
  default: jest.fn(
    ({
      children,
    }: {
      children: React.ReactNode;
      dehydratedState?: unknown;
    }) => <>{children}</>
  ),
}));

jest.mock("@/shared/providers/RequestIntlProvider", () => ({
  __esModule: true,
  default: jest.fn(({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )),
}));

jest.mock("@/shared/providers/queryClient", () => ({
  createAppQueryClient: jest.fn(),
}));

jest.mock("@/shared/infrastructure/supabase/client-server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("@/domains/session/infrastructure/supabase/repositories", () => ({
  createSessionGateway: jest.fn(),
}));

jest.mock("@/domains/session/core/usecases/getCurrentSession", () => ({
  getCurrentSession: jest.fn(),
}));

jest.mock("@/domains/profile/infrastructure/profileGateway.supabase", () => ({
  createProfileGateway: jest.fn(),
}));

jest.mock("@/domains/profile/core/usecases/getProfile", () => ({
  getProfile: jest.fn(),
}));

describe("ProtectedLayout hydration", () => {
  const mockQueryClient = {
    setQueryData: jest.fn(),
    prefetchQuery: jest.fn(),
  };

  const mockSupabaseClient = { tag: "supabase" };
  const mockSessionGateway = { tag: "sessionGateway" };
  const mockProfileGateway = { tag: "profileGateway" };
  const session = {
    userId: "user-1",
    loginEmail: "cyril@example.com",
    accessToken: "",
    isSuperuser: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dehydrateMock.mockReturnValue({ dehydrated: true });

    mockQueryClient.setQueryData.mockReset();
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
    jest.mocked(getCurrentSession).mockResolvedValue(session);
    jest
      .mocked(createProfileGateway)
      .mockReturnValue(mockProfileGateway as never);
    jest.mocked(getProfile).mockResolvedValue(null);
  });

  it("hydrates session and profile queries before rendering protected children", async () => {
    const result = await ProtectedLayout({
      children: <div>Protected content</div>,
    });

    render(result);

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      sessionQueryKeys.session.current(),
      session
    );
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith({
      queryKey: profileQueryKeys.userProfiles.detail(session.userId),
      queryFn: expect.any(Function),
    });
    expect(getProfile).toHaveBeenCalledWith(mockProfileGateway, session.userId);
    expect(dehydrateMock).toHaveBeenCalledWith(mockQueryClient);

    const appProviderMock = jest.mocked(AppProvider);
    expect(appProviderMock).toHaveBeenCalledTimes(1);
    expect(appProviderMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        dehydratedState: { dehydrated: true },
      })
    );
  });
});
