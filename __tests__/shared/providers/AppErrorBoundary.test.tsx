import { NextIntlClientProvider } from "next-intl";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import * as i18n from "@/shared/i18n";
import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";
import messages from "@/shared/i18n/messages/fr.json";
import AppErrorBoundary from "@/shared/providers/AppErrorBoundary";

let mockPathname: string = PAGE_ROUTES.WORKSPACE;

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

const renderWithLocale = (children: React.ReactNode) => {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    mockPathname = PAGE_ROUTES.WORKSPACE;
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(i18n, "useLocale").mockReturnValue("fr");
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

    mockPathname = PAGE_ROUTES.ACCOUNT;

    rerender(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <AppErrorBoundary>
          <StableChild />
        </AppErrorBoundary>
      </NextIntlClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("fresh route")).toBeInTheDocument();
    });
  });

  it("keeps the fallback home action on the active locale", () => {
    jest.spyOn(i18n, "useLocale").mockReturnValue("en");

    const ThrowingChild = () => {
      throw new Error("route crash");
    };

    renderWithLocale(
      <AppErrorBoundary>
        <ThrowingChild />
      </AppErrorBoundary>
    );

    expect(
      screen.getByRole("link", { name: "Revenir à la page d'accueil" })
    ).toHaveAttribute("href", buildMarketingHomePath("en"));
  });
});
