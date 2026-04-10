import { act, renderHook } from "@testing-library/react";

import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { useNavigationFeedbackStore } from "@/shared/stores/useNavigationFeedbackStore";

jest.mock("@/shared/navigation/navigationFeedback.utils", () => ({
  ...jest.requireActual("@/shared/navigation/navigationFeedback.utils"),
  getCurrentLocationHrefNormalized: jest.fn(() => "/current"),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
  }),
}));

describe("useAppRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useNavigationFeedbackStore.getState().reset();
    });
  });

  it("starts navigation feedback on push when href differs from current location", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.push("/other");
    });

    expect(useNavigationFeedbackStore.getState().targetHref).toBe("/other");
    expect(useNavigationFeedbackStore.getState().status).toBe("delaying");
    expect(mockPush).toHaveBeenCalledWith("/other");
  });

  it("does not start feedback when replace uses feedback none", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.replace("/x", { feedback: "none" });
    });

    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
    expect(mockReplace).toHaveBeenCalledWith("/x", {});
  });

  it("does not forward feedback option to next/router", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.push("/z", { scroll: false, feedback: "auto" });
    });

    expect(mockPush).toHaveBeenCalledWith("/z", { scroll: false });
  });

  it("starts navigation feedback immediately on back", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.back();
    });

    expect(useNavigationFeedbackStore.getState().targetHref).toBe("/current");
    expect(useNavigationFeedbackStore.getState().status).toBe("delaying");
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("starts navigation feedback immediately on refresh", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.refresh();
    });

    expect(useNavigationFeedbackStore.getState().targetHref).toBe("/current");
    expect(useNavigationFeedbackStore.getState().status).toBe("delaying");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("allows opting out of feedback for back-like navigations", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.back({ feedback: "none" });
    });

    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
