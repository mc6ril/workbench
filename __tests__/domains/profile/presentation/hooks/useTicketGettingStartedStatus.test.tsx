import { act, renderHook } from "@testing-library/react";

import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";
import { useMyProfile } from "@/domains/profile/presentation/hooks/useMyProfile";
import { useTicketGettingStartedStatus } from "@/domains/profile/presentation/hooks/useTicketGettingStartedStatus";
import { useUpdatePreferences } from "@/domains/profile/presentation/hooks/useUpdatePreferences";

jest.mock("@/domains/profile/presentation/hooks/useMyProfile", () => ({
  useMyProfile: jest.fn(),
}));

jest.mock("@/domains/profile/presentation/hooks/useUpdatePreferences", () => ({
  useUpdatePreferences: jest.fn(),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("useTicketGettingStartedStatus", () => {
  const mutate = jest.fn();
  const mutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useMyProfile).mockReturnValue(
      asMockedReturn<ReturnType<typeof useMyProfile>>({
        data: undefined,
        isLoading: false,
      })
    );

    jest.mocked(useUpdatePreferences).mockReturnValue(
      asMockedReturn<ReturnType<typeof useUpdatePreferences>>({
        mutate,
        mutateAsync,
        isPending: false,
        error: null,
      })
    );
  });

  it("returns the default pending status when the profile is not loaded yet", () => {
    const { result } = renderHook(() => useTicketGettingStartedStatus());

    expect(result.current.status).toBe(
      DEFAULT_USER_PREFERENCES.gettingStartedStatus
    );
    expect(result.current.canAutoOpen).toBe(true);
  });

  it("returns the persisted status from profile preferences", () => {
    jest.mocked(useMyProfile).mockReturnValue(
      asMockedReturn<ReturnType<typeof useMyProfile>>({
        data: {
          preferences: {
            ...DEFAULT_USER_PREFERENCES,
            gettingStartedStatus: "completed",
          },
        },
        isLoading: false,
      })
    );

    const { result } = renderHook(() => useTicketGettingStartedStatus());

    expect(result.current.status).toBe("completed");
    expect(result.current.canAutoOpen).toBe(false);
  });

  it("persists skipped status via useUpdatePreferences", () => {
    const { result } = renderHook(() => useTicketGettingStartedStatus());

    act(() => {
      result.current.markSkipped();
    });

    expect(mutate).toHaveBeenCalledWith({
      gettingStartedStatus: "skipped",
    });
  });

  it("persists completed status via useUpdatePreferences", () => {
    const { result } = renderHook(() => useTicketGettingStartedStatus());

    act(() => {
      result.current.markCompleted();
    });

    expect(mutate).toHaveBeenCalledWith({
      gettingStartedStatus: "completed",
    });
  });

  it("persists status asynchronously via useUpdatePreferences", async () => {
    mutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTicketGettingStartedStatus());

    await act(async () => {
      await result.current.setStatusAsync("skipped");
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      gettingStartedStatus: "skipped",
    });
  });
});
