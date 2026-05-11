import { PAGE_ROUTES } from "@/shared/constants/routes";
import {
  buildHomePath,
  buildLegalPath,
  getResolvedLocaleFromPathname,
  isDefaultLocalePath,
  localizePublicPathname,
} from "@/shared/i18n/publicPaths";

describe("publicPaths", () => {
  it("builds unprefixed paths for the default locale", () => {
    expect(buildHomePath("fr")).toBe(PAGE_ROUTES.HOME);
    expect(buildLegalPath("fr")).toBe(PAGE_ROUTES.LEGAL);
  });

  it("builds prefixed paths for secondary locales", () => {
    expect(buildHomePath("en")).toBe("/en");
    expect(buildLegalPath("es")).toBe("/es/legal");
  });

  it("detects the locale encoded by public URLs", () => {
    expect(getResolvedLocaleFromPathname(PAGE_ROUTES.HOME)).toBe("fr");
    expect(getResolvedLocaleFromPathname(PAGE_ROUTES.LEGAL)).toBe("fr");
    expect(getResolvedLocaleFromPathname(buildHomePath("en"))).toBe("en");
    expect(getResolvedLocaleFromPathname(buildLegalPath("es"))).toBe("es");
    expect(getResolvedLocaleFromPathname(PAGE_ROUTES.WORKSPACE)).toBeNull();
  });

  it("recognizes default-locale paths", () => {
    expect(isDefaultLocalePath(PAGE_ROUTES.HOME)).toBe(true);
    expect(isDefaultLocalePath(`${PAGE_ROUTES.LEGAL}/`)).toBe(true);
    expect(isDefaultLocalePath(buildHomePath("en"))).toBe(false);
  });

  it("localizes paths while keeping their public canonical shape", () => {
    expect(localizePublicPathname(PAGE_ROUTES.HOME, "en")).toBe("/en");
    expect(localizePublicPathname("/legal/privacy", "en")).toBe(
      "/en/legal/privacy"
    );
  });
});
