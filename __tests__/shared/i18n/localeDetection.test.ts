import {
  defaultLocale,
  matchSupportedLocale,
  parseAcceptLanguageHeader,
  resolveLocale,
} from "@/shared/i18n/config";

describe("locale detection", () => {
  it("matches exact supported locales", () => {
    expect(matchSupportedLocale("en")).toBe("en");
    expect(matchSupportedLocale("fr")).toBe("fr");
  });

  it("matches base locales from BCP 47 variants", () => {
    expect(matchSupportedLocale("es-MX")).toBe("es");
    expect(matchSupportedLocale("FR_fr")).toBe("fr");
  });

  it("orders Accept-Language candidates by quality first", () => {
    expect(
      parseAcceptLanguageHeader("en-GB;q=0.6, fr-FR;q=0.9, es;q=0.8")
    ).toEqual(["fr-FR", "es", "en-GB"]);
  });

  it("prefers an explicit locale over cookie and browser locales", () => {
    expect(
      resolveLocale({
        preferredLocale: "es-AR",
        cookieLocale: "en",
        acceptLanguage: "fr-FR,fr;q=0.9",
      })
    ).toBe("es");
  });

  it("falls back from cookie to browser locale to default locale", () => {
    expect(
      resolveLocale({
        cookieLocale: "en-US",
        acceptLanguage: "fr-FR,fr;q=0.9",
      })
    ).toBe("en");

    expect(
      resolveLocale({
        cookieLocale: "de-DE",
        acceptLanguage: "es-ES,es;q=0.9",
      })
    ).toBe("es");

    expect(
      resolveLocale({
        cookieLocale: "de-DE",
        acceptLanguage: "it-IT,it;q=0.9",
      })
    ).toBe(defaultLocale);
  });
});
