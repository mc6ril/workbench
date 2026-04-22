import { act, renderHook } from "@testing-library/react";

import { useAppRouter } from "@/shared/navigation/useAppRouter";

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
  });

  it("pushes immediately without extra feedback state", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.push("/other");
    });

    expect(mockPush).toHaveBeenCalledWith("/other");
  });

  it("keeps omitting the feedback option for replace", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.replace("/x", { feedback: "none" });
    });

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

  it("navigates back immediately", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.back();
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("refreshes immediately", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.refresh();
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("accepts the legacy feedback option on back-like navigations", () => {
    const { result } = renderHook(() => {
      return useAppRouter();
    });

    act(() => {
      result.current.back({ feedback: "none" });
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
