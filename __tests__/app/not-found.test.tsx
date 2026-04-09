import * as nextIntlServer from "next-intl/server";
import { render, screen } from "@testing-library/react";

import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";

import NotFoundPage from "@/app/not-found";

describe("NotFoundPage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("routes the primary action to the localized marketing home", async () => {
    jest.spyOn(nextIntlServer, "getLocale").mockResolvedValue("en");

    render(await NotFoundPage());

    expect(
      screen.getByRole("link", { name: "Return to the home page" })
    ).toHaveAttribute("href", buildMarketingHomePath("en"));
  });
});
