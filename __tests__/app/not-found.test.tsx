import { render, screen } from "@testing-library/react";

jest.mock("use-intl", () => ({
  IntlProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import { buildHomePath } from "@/shared/i18n/publicPaths";

import NotFoundPage from "@/app/not-found";

jest.mock("next/navigation", () => ({
  usePathname: () => "/en/missing-page",
}));

describe("NotFoundPage", () => {
  it("routes the primary action to the localized home", () => {
    render(<NotFoundPage />);

    expect(
      screen
        .getAllByRole("link")
        .find((link) => link.getAttribute("href") === "/en")
    ).toHaveAttribute("href", buildHomePath("en"));
  });
});
