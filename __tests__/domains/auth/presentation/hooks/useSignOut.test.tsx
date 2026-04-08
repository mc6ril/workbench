import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { navigateToDocumentPath } from "@/shared/navigation/documentNavigation";

import { signOutUser } from "@/domains/auth/core/usecases/user/signOutUser";
import { authGateway } from "@/domains/auth/infrastructure/supabase/repositories";
import { useSignOut } from "@/domains/auth/presentation/hooks/user/useSignOut";
import { invalidatePostAuthMutation } from "@/domains/auth/presentation/utils/invalidatePostAuthMutation";

jest.mock("@/domains/auth/core/usecases/user/signOutUser", () => ({
  signOutUser: jest.fn(),
}));

jest.mock("@/domains/auth/infrastructure/supabase/repositories", () => ({
  authGateway: { tag: "authGateway" },
}));

jest.mock("@/domains/auth/presentation/utils/invalidatePostAuthMutation", () => ({
  invalidatePostAuthMutation: jest.fn(),
}));

jest.mock("@/shared/navigation/documentNavigation", () => ({
  navigateToDocumentPath: jest.fn(),
}));

describe("useSignOut", () => {
  let queryClient: QueryClient;
  const clearSpy = jest.fn();

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    queryClient = new QueryClient();
    clearSpy.mockReset();
    jest.spyOn(queryClient, "clear").mockImplementation(clearSpy);

    jest.mocked(signOutUser).mockResolvedValue(undefined);
    jest.mocked(invalidatePostAuthMutation).mockResolvedValue(undefined);
    jest.mocked(navigateToDocumentPath).mockImplementation(() => {});
  });

  it("clears auth caches and performs a document redirect to home", async () => {
    const { result } = renderHook(() => useSignOut(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(signOutUser).toHaveBeenCalledWith(authGateway);
    });

    await waitFor(() => {
      expect(invalidatePostAuthMutation).toHaveBeenCalledWith(queryClient);
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(navigateToDocumentPath).toHaveBeenCalledWith(PAGE_ROUTES.HOME);
  });
});
