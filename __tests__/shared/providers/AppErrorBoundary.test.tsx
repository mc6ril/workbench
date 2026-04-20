import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { localeCookieName } from "@/shared/i18n/config";
import { getFallbackMessages } from "@/shared/i18n/fallbackMessages";
import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";
import AppErrorBoundary from "@/shared/providers/AppErrorBoundary";

let mockPathname: string = PAGE_ROUTES.WORKSPACE;

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    mockPathname = PAGE_ROUTES.WORKSPACE;
    jest.spyOn(console, "error").mockImplementation(() => {});
    document.cookie = `${localeCookieName}=fr; path=/`;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the fallback UI and retries the subtree on demand", async () => {
    let shouldThrow = true;

    const ProblemChild = () => {
      if (shouldThrow) {
        throw new Error("boom");
      }

      return <div>safe screen</div>;
    };

    render(
      <AppErrorBoundary>
        <ProblemChild />
      </AppErrorBoundary>
    );

    expect(
      screen.getByText(getFallbackMessages("fr").error.title)
    ).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(
      screen.getByRole("button", {
        name: getFallbackMessages("fr").error.primaryActionAriaLabel,
      })
    );

    await waitFor(() => {
      expect(screen.getByText("safe screen")).toBeInTheDocument();
    });
  });

  it("resets itself when the route changes after an error", async () => {
    const StableChild = () => <div>fresh route</div>;

    const ThrowingChild = () => {
      throw new Error("route crash");
    };

    const { rerender } = render(
      <AppErrorBoundary>
        <ThrowingChild />
      </AppErrorBoundary>
    );

    expect(
      screen.getByText(getFallbackMessages("fr").error.title)
    ).toBeInTheDocument();

    mockPathname = PAGE_ROUTES.ACCOUNT;

    rerender(
      <AppErrorBoundary>
        <StableChild />
      </AppErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText("fresh route")).toBeInTheDocument();
    });
  });

  it("keeps the fallback home action on the active locale", () => {
    document.cookie = `${localeCookieName}=en; path=/`;
    mockPathname = "/en";

    const ThrowingChild = () => {
      throw new Error("route crash");
    };

    render(
      <AppErrorBoundary>
        <ThrowingChild />
      </AppErrorBoundary>
    );

    expect(
      screen.getByRole("link", {
        name: getFallbackMessages("en").error.secondaryActionAriaLabel,
      })
    ).toHaveAttribute("href", buildMarketingHomePath("en"));
  });
});
