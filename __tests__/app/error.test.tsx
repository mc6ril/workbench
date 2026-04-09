import { render, screen } from "@testing-library/react";

import * as i18n from "@/shared/i18n";
import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";

import ErrorPage from "@/app/error";

describe("ErrorPage", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(i18n, "useLocale").mockReturnValue("fr");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("routes the home action to the current marketing locale", () => {
    jest.spyOn(i18n, "useLocale").mockReturnValue("en");

    render(<ErrorPage error={new Error("boom")} reset={jest.fn()} />);

    expect(
      screen.getByRole("link", { name: "Revenir à la page d'accueil" })
    ).toHaveAttribute("href", buildMarketingHomePath("en"));
  });
});
