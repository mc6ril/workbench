const setQueryDataMock = jest.fn();
const useMutationMock = jest.fn();
const useSessionMock = jest.fn();
const useMyProfileMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: (options: unknown) => {
    useMutationMock(options);
    return options;
  },
  useQueryClient: () => ({
    setQueryData: setQueryDataMock,
  }),
}));

jest.mock("@/domains/session/presentation/hooks/useSession", () => ({
  useSession: (...args: unknown[]) => useSessionMock(...args),
}));

jest.mock("@/domains/profile/presentation/hooks/useMyProfile", () => ({
  useMyProfile: (...args: unknown[]) => useMyProfileMock(...args),
}));

jest.mock("@/domains/profile/core/usecases/updatePreferences", () => ({
  updatePreferences: jest.fn(),
}));

jest.mock("@/domains/profile/infrastructure/profileGateway.browser", () => ({
  profileGateway: {},
}));

import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";
import { updatePreferences } from "@/domains/profile/core/usecases/updatePreferences";
import { queryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { useUpdatePreferences } from "@/domains/profile/presentation/hooks/useUpdatePreferences";

describe("useUpdatePreferences", () => {
  const session = { userId: "user-1" };
  const profile = {
    id: "user-1",
    email: "user@example.com",
    displayName: "User",
    avatarUrl: null,
    preferences: DEFAULT_USER_PREFERENCES,
    termsAcceptedAt: null,
    createdAt: new Date("2026-04-10T08:00:00.000Z"),
    updatedAt: new Date("2026-04-10T08:00:00.000Z"),
  };

  beforeEach(() => {
    useMutationMock.mockReset();
    setQueryDataMock.mockReset();
    useSessionMock.mockReset();
    useMyProfileMock.mockReset();
    jest.mocked(updatePreferences).mockReset();

    useSessionMock.mockReturnValue({
      data: session,
    });
    useMyProfileMock.mockReturnValue({
      data: profile,
    });
    jest.mocked(updatePreferences).mockResolvedValue(undefined);
  });

  it("writes merged preferences into the cached profile after a successful update", () => {
    useUpdatePreferences();

    const mutationOptions = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess?: (data: void, input: { gettingStartedStatus: "completed" }) => void;
    };

    mutationOptions.onSuccess?.(undefined, {
      gettingStartedStatus: "completed",
    });

    expect(setQueryDataMock).toHaveBeenCalledWith(
      queryKeys.userProfiles.detail(session.userId),
      expect.any(Function)
    );

    const updater = setQueryDataMock.mock.calls[0]?.[1] as (
      currentProfile: typeof profile
    ) => typeof profile;

    expect(updater(profile)).toEqual({
      ...profile,
      preferences: {
        ...DEFAULT_USER_PREFERENCES,
        gettingStartedStatus: "completed",
      },
    });
  });

  it("uses the cached preferences as the merge base for the mutation", async () => {
    useUpdatePreferences();

    const mutationOptions = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: { gettingStartedStatus: "skipped" }) => Promise<void>;
    };

    await mutationOptions.mutationFn({
      gettingStartedStatus: "skipped",
    });

    expect(updatePreferences).toHaveBeenCalledWith(
      {},
      session.userId,
      DEFAULT_USER_PREFERENCES,
      {
        gettingStartedStatus: "skipped",
      }
    );
  });
});
