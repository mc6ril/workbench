import { act, render } from "@testing-library/react";

import {
  NAVIGATION_FEEDBACK_MIN_VISIBLE_MS,
  NAVIGATION_FEEDBACK_SHOW_DELAY_MS,
} from "@/shared/navigation/navigationFeedback.constants";
import NavigationFeedbackController from "@/shared/navigation/NavigationFeedbackController";
import { useNavigationFeedbackStore } from "@/shared/stores/useNavigationFeedbackStore";

const mockUsePathname = jest.fn(() => "/current");
const mockUseSearchParams = jest.fn(() => ({
  toString: () => "",
}));

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock("@/shared/design-system/navigation_pending_overlay", () => {
  return () => null;
});

describe("NavigationFeedbackController", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    act(() => {
      useNavigationFeedbackStore.getState().reset();
    });
  });

  afterEach(() => {
    act(() => {
      useNavigationFeedbackStore.getState().reset();
    });
    jest.useRealTimers();
  });

  it("completes render-mode feedback when the router rerenders on the same href", () => {
    const { rerender } = render(<NavigationFeedbackController />);

    act(() => {
      useNavigationFeedbackStore
        .getState()
        .beginNavigation("/current", { completionMode: "render" });
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS);
    });

    expect(useNavigationFeedbackStore.getState().status).toBe("visible");

    rerender(<NavigationFeedbackController />);

    expect(useNavigationFeedbackStore.getState().status).toBe("visible");

    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_MIN_VISIBLE_MS);
    });

    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
  });
});
