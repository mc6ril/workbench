import { act, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";

import NavigationPendingOverlay from "@/shared/design-system/navigation_pending_overlay";
import { NAVIGATION_FEEDBACK_SHOW_DELAY_MS } from "@/shared/navigation/navigationFeedback.constants";
import { useNavigationFeedbackStore } from "@/shared/stores/useNavigationFeedbackStore";

jest.mock("@/shared/design-system/loader", () => ({
  __esModule: true,
  default: () => <div data-testid="loader-mock" />,
}));

const overlayStylesheetPath = path.join(
  process.cwd(),
  "src/shared/design-system/navigation_pending_overlay/navigation_pending_overlay.module.scss"
);

const getOverlayStylesBlock = () => {
  const stylesheet = readFileSync(overlayStylesheetPath, "utf8").replace(
    /\s+/g,
    " "
  );
  const match = stylesheet.match(/\.overlay\s*\{([^}]*)\}/);

  if (!match) {
    throw new Error("Unable to locate the .overlay block in the stylesheet.");
  }

  return match[1];
};

describe("NavigationPendingOverlay", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      useNavigationFeedbackStore.getState().reset();
    });
    jest.useRealTimers();
  });

  it("renders nothing when status is not visible", () => {
    const { container } = render(<NavigationPendingOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it("renders overlay when status is visible", () => {
    act(() => {
      useNavigationFeedbackStore.getState().beginNavigation("/x");
    });
    act(() => {
      jest.advanceTimersByTime(NAVIGATION_FEEDBACK_SHOW_DELAY_MS);
    });

    render(<NavigationPendingOverlay />);
    const overlay = screen.getByRole("status");

    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("overlay");
    expect(screen.getByTestId("loader-mock")).toBeInTheDocument();
  });

  it("keeps the full-screen overlay interactive so clicks cannot pass through", () => {
    const overlayStyles = getOverlayStylesBlock();

    expect(overlayStyles).toContain("pointer-events: auto;");
    expect(overlayStyles).not.toContain("pointer-events: none;");
  });
});
