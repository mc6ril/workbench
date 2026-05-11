import { render, screen, waitFor } from "@testing-library/react";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { localeCookieName } from "@/shared/i18n/config";
import { getFallbackMessages } from "@/shared/i18n/fallbackMessages";
import {
  buildMarketingHomePath,
  buildMarketingLegalPath,
} from "@/shared/i18n/marketingPaths";

let mockPathname: string = PAGE_ROUTES.WORKSPACE;

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

import GlobalErrorPage from "@/app/global-error";

describe("GlobalErrorPage", () => {
  beforeEach(() => {
    mockPathname = PAGE_ROUTES.WORKSPACE;
    document.cookie = `${localeCookieName}=; Max-Age=0; path=/`;
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uses the locale cookie instead of always forcing the default locale", async () => {
    document.cookie = `${localeCookieName}=es; path=/`;

    render(<GlobalErrorPage error={new Error("boom")} reset={jest.fn()} />);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "es-ES");
    });

    expect(
      screen.getByRole("link", {
        name: getFallbackMessages("es").globalError.secondaryActionAriaLabel,
      })
    ).toHaveAttribute("href", buildMarketingHomePath("es"));
  });

  it("uses the marketing locale encoded in the pathname", async () => {
    mockPathname = buildMarketingLegalPath("en");

    render(<GlobalErrorPage error={new Error("boom")} reset={jest.fn()} />);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("lang", "en-US");
    });

    expect(
      screen.getByRole("link", {
        name: getFallbackMessages("en").globalError.secondaryActionAriaLabel,
      })
    ).toHaveAttribute("href", buildMarketingHomePath("en"));
  });
});
