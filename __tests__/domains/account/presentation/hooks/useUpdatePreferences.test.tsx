const setQueryDataMock = jest.fn();
const useMutationMock = jest.fn();
const useAuthIdentityMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: (options: unknown) => {
    useMutationMock(options);
    return options;
  },
  useQueryClient: () => ({
    setQueryData: setQueryDataMock,
  }),
}));

jest.mock("@/domains/auth/presentation/hooks/identity/useAuthIdentity", () => ({
  useAuthIdentity: (...args: unknown[]) => useAuthIdentityMock(...args),
}));

jest.mock("@/domains/account/core/usecases/updatePreferences", () => ({
  updatePreferences: jest.fn(),
}));

jest.mock("@/domains/account/infrastructure/accountGateway.browser", () => ({
  accountGateway: {},
}));

import { DEFAULT_USER_PREFERENCES } from "@/shared/user/userPreferences";

import { updatePreferences } from "@/domains/account/core/usecases/updatePreferences";
import { useUpdatePreferences } from "@/domains/account/presentation/hooks/useUpdatePreferences";
import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { queryKeys as authQueryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";

describe("useUpdatePreferences", () => {
  const identity: CurrentAuthIdentity = {
    userId: "user-1",
    loginEmail: "user@example.com",
    isSuperuser: false,
    canUpdatePassword: false,
    displayName: null,
    avatarUrl: null,
    preferences: DEFAULT_USER_PREFERENCES,
  };

  beforeEach(() => {
    useMutationMock.mockReset();
    setQueryDataMock.mockReset();
    useAuthIdentityMock.mockReset();
    jest.mocked(updatePreferences).mockReset();

    useAuthIdentityMock.mockReturnValue({ data: identity });
    jest.mocked(updatePreferences).mockResolvedValue(undefined);
  });

  it("writes merged preferences into the authIdentity cache after a successful update", () => {
    useUpdatePreferences();

    const mutationOptions = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess?: (data: void, input: { theme: "dark" }) => void;
    };

    mutationOptions.onSuccess?.(undefined, { theme: "dark" });

    expect(setQueryDataMock).toHaveBeenCalledWith(
      authQueryKeys.authIdentity.current(),
      expect.any(Function)
    );

    const updater = setQueryDataMock.mock.calls[0]?.[1] as (
      current: CurrentAuthIdentity
    ) => CurrentAuthIdentity;

    expect(updater(identity)).toEqual({
      ...identity,
      preferences: {
        ...DEFAULT_USER_PREFERENCES,
        theme: "dark",
      },
    });
  });

  it("uses the cached preferences as the merge base for the mutation", async () => {
    useUpdatePreferences();

    const mutationOptions = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: { theme: "dark" }) => Promise<void>;
    };

    await mutationOptions.mutationFn({ theme: "dark" });

    expect(updatePreferences).toHaveBeenCalledWith(
      {},
      identity.userId,
      DEFAULT_USER_PREFERENCES,
      { theme: "dark" }
    );
  });
});
