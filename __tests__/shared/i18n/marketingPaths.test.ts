import { PAGE_ROUTES } from "@/shared/constants/routes";
import {
  buildMarketingHomePath,
  buildMarketingLegalPath,
  buildMarketingPricingPath,
  getResolvedMarketingLocaleFromPathname,
  isDefaultLocaleMarketingPathname,
  localizeMarketingPathname,
} from "@/shared/i18n/marketingPaths";

describe("marketingPaths", () => {
  it("builds unprefixed paths for the default locale", () => {
    expect(buildMarketingHomePath("fr")).toBe(PAGE_ROUTES.HOME);
    expect(buildMarketingPricingPath("fr")).toBe(PAGE_ROUTES.PRICING);
    expect(buildMarketingLegalPath("fr")).toBe(PAGE_ROUTES.LEGAL);
  });

  it("builds prefixed paths for secondary locales", () => {
    expect(buildMarketingHomePath("en")).toBe("/en");
    expect(buildMarketingPricingPath("en")).toBe("/en/pricing");
    expect(buildMarketingLegalPath("es")).toBe("/es/legal");
  });

  it("detects the locale encoded by marketing URLs", () => {
    expect(getResolvedMarketingLocaleFromPathname(PAGE_ROUTES.HOME)).toBe("fr");
    expect(getResolvedMarketingLocaleFromPathname(PAGE_ROUTES.PRICING)).toBe(
      "fr"
    );
    expect(getResolvedMarketingLocaleFromPathname(PAGE_ROUTES.LEGAL)).toBe(
      "fr"
    );
    expect(
      getResolvedMarketingLocaleFromPathname(buildMarketingHomePath("en"))
    ).toBe("en");
    expect(
      getResolvedMarketingLocaleFromPathname(buildMarketingLegalPath("es"))
    ).toBe("es");
    expect(
      getResolvedMarketingLocaleFromPathname(PAGE_ROUTES.WORKSPACE)
    ).toBeNull();
  });

  it("recognizes default-locale marketing paths", () => {
    expect(isDefaultLocaleMarketingPathname(PAGE_ROUTES.HOME)).toBe(true);
    expect(isDefaultLocaleMarketingPathname(PAGE_ROUTES.PRICING)).toBe(true);
    expect(isDefaultLocaleMarketingPathname(`${PAGE_ROUTES.LEGAL}/`)).toBe(
      true
    );
    expect(isDefaultLocaleMarketingPathname(buildMarketingHomePath("en"))).toBe(
      false
    );
  });

  it("localizes marketing paths while keeping their public canonical shape", () => {
    expect(localizeMarketingPathname(PAGE_ROUTES.HOME, "en")).toBe("/en");
    expect(localizeMarketingPathname(PAGE_ROUTES.PRICING, "es")).toBe(
      "/es/pricing"
    );
    expect(localizeMarketingPathname("/legal/privacy", "en")).toBe(
      "/en/legal/privacy"
    );
    expect(localizeMarketingPathname("/en/pricing", "fr")).toBe(
      PAGE_ROUTES.PRICING
    );
  });
});
