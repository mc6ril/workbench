import { render, screen } from "@testing-library/react";

import { localeCookieName } from "@/shared/i18n/config";
import { getFallbackMessages } from "@/shared/i18n/fallbackMessages";
import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";

let mockPathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

import ErrorPage from "@/app/error";

describe("ErrorPage", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockPathname = "/";
    document.cookie = `${localeCookieName}=; Max-Age=0; path=/`;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("routes the home action to the current marketing locale", () => {
    mockPathname = "/en";

    render(<ErrorPage error={new Error("boom")} reset={jest.fn()} />);

    expect(
      screen.getByRole("link", {
        name: getFallbackMessages("en").error.secondaryActionAriaLabel,
      })
    ).toHaveAttribute("href", buildMarketingHomePath("en"));
  });
});
