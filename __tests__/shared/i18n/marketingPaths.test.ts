import {
  buildMarketingHomePath,
  buildMarketingLegalPath,
  buildMarketingPricingPath,
  getResolvedMarketingLocaleFromPathname,
  isDefaultLocaleMarketingPathname,
  isDefaultLocalePrefixedMarketingPathname,
  stripDefaultLocalePrefix,
} from "@/shared/i18n/marketingPaths";

describe("marketingPaths", () => {
  it("builds unprefixed paths for the default locale", () => {
    expect(buildMarketingHomePath("fr")).toBe("/");
    expect(buildMarketingPricingPath("fr")).toBe("/pricing");
    expect(buildMarketingLegalPath("fr")).toBe("/legal");
  });

  it("builds prefixed paths for secondary locales", () => {
    expect(buildMarketingHomePath("en")).toBe("/en");
    expect(buildMarketingPricingPath("en")).toBe("/en/pricing");
    expect(buildMarketingLegalPath("es")).toBe("/es/legal");
  });

  it("detects the locale encoded by marketing URLs", () => {
    expect(getResolvedMarketingLocaleFromPathname("/")).toBe("fr");
    expect(getResolvedMarketingLocaleFromPathname("/pricing")).toBe("fr");
    expect(getResolvedMarketingLocaleFromPathname("/legal")).toBe("fr");
    expect(getResolvedMarketingLocaleFromPathname("/en")).toBe("en");
    expect(getResolvedMarketingLocaleFromPathname("/es/legal")).toBe("es");
    expect(getResolvedMarketingLocaleFromPathname("/workspace")).toBeNull();
  });

  it("recognizes default-locale marketing paths", () => {
    expect(isDefaultLocaleMarketingPathname("/")).toBe(true);
    expect(isDefaultLocaleMarketingPathname("/pricing")).toBe(true);
    expect(isDefaultLocaleMarketingPathname("/legal/")).toBe(true);
    expect(isDefaultLocaleMarketingPathname("/en")).toBe(false);
  });

  it("rewrites legacy prefixed default-locale paths to the canonical URL", () => {
    expect(isDefaultLocalePrefixedMarketingPathname("/fr")).toBe(true);
    expect(isDefaultLocalePrefixedMarketingPathname("/fr/pricing")).toBe(true);
    expect(isDefaultLocalePrefixedMarketingPathname("/fr/legal/privacy")).toBe(
      true
    );
    expect(isDefaultLocalePrefixedMarketingPathname("/fr/board")).toBe(false);

    expect(stripDefaultLocalePrefix("/fr")).toBe("/");
    expect(stripDefaultLocalePrefix("/fr/pricing")).toBe("/pricing");
    expect(stripDefaultLocalePrefix("/fr/legal/privacy")).toBe(
      "/legal/privacy"
    );
  });
});
