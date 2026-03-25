import { act, renderHook } from "@testing-library/react";

import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profilePreferences.schema";
import { useEpicsGettingStartedStatus } from "@/domains/profile/presentation/hooks/useEpicsGettingStartedStatus";
import { useMyProfile } from "@/domains/profile/presentation/hooks/useMyProfile";
import { useUpdatePreferences } from "@/domains/profile/presentation/hooks/useUpdatePreferences";

jest.mock("@/domains/profile/presentation/hooks/useMyProfile", () => ({
  useMyProfile: jest.fn(),
}));

jest.mock("@/domains/profile/presentation/hooks/useUpdatePreferences", () => ({
  useUpdatePreferences: jest.fn(),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("useEpicsGettingStartedStatus", () => {
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
    const { result } = renderHook(() => useEpicsGettingStartedStatus());

    expect(result.current.status).toBe(
      DEFAULT_USER_PREFERENCES.epicsGettingStartedStatus
    );
    expect(result.current.canAutoOpen).toBe(true);
  });

  it("returns the persisted status from profile preferences", () => {
    jest.mocked(useMyProfile).mockReturnValue(
      asMockedReturn<ReturnType<typeof useMyProfile>>({
        data: {
          preferences: {
            ...DEFAULT_USER_PREFERENCES,
            epicsGettingStartedStatus: "completed",
          },
        },
        isLoading: false,
      })
    );

    const { result } = renderHook(() => useEpicsGettingStartedStatus());

    expect(result.current.status).toBe("completed");
    expect(result.current.canAutoOpen).toBe(false);
  });

  it("persists skipped status via useUpdatePreferences", () => {
    const { result } = renderHook(() => useEpicsGettingStartedStatus());

    act(() => {
      result.current.markSkipped();
    });

    expect(mutate).toHaveBeenCalledWith({
      epicsGettingStartedStatus: "skipped",
    });
  });

  it("persists completed status via useUpdatePreferences", () => {
    const { result } = renderHook(() => useEpicsGettingStartedStatus());

    act(() => {
      result.current.markCompleted();
    });

    expect(mutate).toHaveBeenCalledWith({
      epicsGettingStartedStatus: "completed",
    });
  });

  it("persists status asynchronously via useUpdatePreferences", async () => {
    mutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useEpicsGettingStartedStatus());

    await act(async () => {
      await result.current.setStatusAsync("skipped");
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      epicsGettingStartedStatus: "skipped",
    });
  });
});
