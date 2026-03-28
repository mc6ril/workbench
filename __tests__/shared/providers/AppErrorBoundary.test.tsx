import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { LocaleProvider } from "@/shared/i18n/LocaleProvider";
import AppErrorBoundary from "@/shared/providers/AppErrorBoundary";

let mockPathname = "/workspace";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

const renderWithLocale = (children: React.ReactNode) => {
  return render(
    <LocaleProvider initialLocale="fr" key="fr">
      {children}
    </LocaleProvider>
  );
};

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    mockPathname = "/workspace";
    jest.spyOn(console, "error").mockImplementation(() => {});
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

    renderWithLocale(
      <AppErrorBoundary>
        <ProblemChild />
      </AppErrorBoundary>
    );

    expect(screen.getByText("Quelque chose a dérapé")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(
      screen.getByRole("button", { name: "Réessayer de charger la page" })
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

    const { rerender } = renderWithLocale(
      <AppErrorBoundary>
        <ThrowingChild />
      </AppErrorBoundary>
    );

    expect(screen.getByText("Quelque chose a dérapé")).toBeInTheDocument();

    mockPathname = "/account";

    rerender(
      <LocaleProvider initialLocale="fr" key="fr">
        <AppErrorBoundary>
          <StableChild />
        </AppErrorBoundary>
      </LocaleProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("fresh route")).toBeInTheDocument();
    });
  });
});
