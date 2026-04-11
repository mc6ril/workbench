import { act } from "@testing-library/react";

import {
  NAVIGATION_FEEDBACK_HARD_TIMEOUT_MS,
  NAVIGATION_FEEDBACK_MIN_VISIBLE_MS,
  NAVIGATION_FEEDBACK_SHOW_DELAY_MS,
} from "@/shared/navigation/navigationFeedback.constants";
import { useNavigationFeedbackStore } from "@/shared/stores/useNavigationFeedbackStore";

describe("useNavigationFeedbackStore", () => {
  beforeEach(() => {
    jest.useFakeTimers();
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

  it("does not reach visible if navigation completes while delaying", () => {
    act(() => {
      useNavigationFeedbackStore.getState().beginNavigation("/a");
    });
    act(() => {
      useNavigationFeedbackStore.getState().completeNavigation("/a");
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS + 1);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
  });

  it("becomes visible after show delay when navigation is still pending", () => {
    act(() => {
      useNavigationFeedbackStore.getState().beginNavigation("/b");
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("visible");
  });

  it("keeps overlay visible at least minVisibleMs after completion", () => {
    act(() => {
      useNavigationFeedbackStore.getState().beginNavigation("/c");
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS);
    });
    act(() => {
      useNavigationFeedbackStore.getState().completeNavigation("/c");
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("visible");
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_MIN_VISIBLE_MS - 1);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("visible");
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
  });

  it("completes when middleware redirects an auth page to workspace", () => {
    act(() => {
      useNavigationFeedbackStore
        .getState()
        .beginNavigation("/auth/signin?redirect=%2Fworkspace");
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS);
    });
    act(() => {
      useNavigationFeedbackStore.getState().completeNavigation("/workspace");
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("visible");
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_MIN_VISIBLE_MS);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
  });

  it("completes when middleware redirects a protected route to signin", () => {
    act(() => {
      useNavigationFeedbackStore
        .getState()
        .beginNavigation("/workspace?from=%2Flanding");
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS);
    });
    act(() => {
      useNavigationFeedbackStore
        .getState()
        .completeNavigation("/auth/signin?redirect=%2Fworkspace");
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("visible");
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_MIN_VISIBLE_MS);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
  });

  it("completes when a route resolves to a nested redirected pathname", () => {
    const projectRoot = "/11111111-1111-1111-1111-111111111111";

    act(() => {
      useNavigationFeedbackStore.getState().beginNavigation(projectRoot);
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS);
    });
    act(() => {
      useNavigationFeedbackStore
        .getState()
        .completeNavigation(`${projectRoot}/board`);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("visible");
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_MIN_VISIBLE_MS);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
  });

  it("completes render-mode navigation on the next router render", () => {
    act(() => {
      useNavigationFeedbackStore
        .getState()
        .beginNavigation("/current", { completionMode: "render" });
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS);
    });
    act(() => {
      useNavigationFeedbackStore.getState().completeNavigation("/different");
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("visible");
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_MIN_VISIBLE_MS);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
  });

  it("replaces an in-flight navigation when beginNavigation is called again", () => {
    act(() => {
      useNavigationFeedbackStore.getState().beginNavigation("/first");
    });
    act(() => {
      useNavigationFeedbackStore.getState().beginNavigation("/second");
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS);
    });
    expect(useNavigationFeedbackStore.getState().targetHref).toBe("/second");
    expect(useNavigationFeedbackStore.getState().completionMode).toBe("route");
    act(() => {
      useNavigationFeedbackStore.getState().completeNavigation("/first");
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("visible");
    act(() => {
      useNavigationFeedbackStore.getState().completeNavigation("/second");
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_MIN_VISIBLE_MS);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
  });

  it("resets on hard timeout", () => {
    act(() => {
      useNavigationFeedbackStore.getState().beginNavigation("/slow");
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_HARD_TIMEOUT_MS);
    });
    expect(useNavigationFeedbackStore.getState().status).toBe("idle");
  });
});
