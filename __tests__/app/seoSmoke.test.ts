/**
 * @jest-environment node
 */
import { supportedLocales } from "@/shared/i18n/config";
import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";
import { getSiteUrl } from "@/shared/seo/siteUrl";

import { GET as manifestGet } from "@/app/manifest/[locale]/route";
import sitemap from "@/app/sitemap";

describe("SEO smoke: sitemap and manifest", () => {
  it("sitemap includes all marketing locales and expected paths", () => {
    const entries = sitemap();
    const base = getSiteUrl().origin;
    expect(entries.length).toBeGreaterThan(0);
    for (const locale of supportedLocales) {
      const home = new URL(buildMarketingHomePath(locale), base).toString();
      expect(entries.some((e) => e.url === home)).toBe(true);
    }
  });

  it("manifest route returns JSON with correct content type", async () => {
    const res = await manifestGet(
      new Request("http://localhost:3000/manifest/fr"),
      { params: Promise.resolve({ locale: "fr" }) }
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain(
      "application/manifest+json"
    );
    const body = (await res.json()) as {
      lang: string;
      name: string;
      scope: string;
      start_url: string;
    };
    expect(body.lang).toBe("fr");
    expect(typeof body.name).toBe("string");
    expect(body.start_url).toBe("/");
    expect(body.scope).toBe("/");
  });

  it("manifest route falls back locale for unknown segment", async () => {
    const res = await manifestGet(
      new Request("http://localhost:3000/manifest/xx"),
      { params: Promise.resolve({ locale: "xx" }) }
    );
    const body = (await res.json()) as { lang: string };
    expect(body.lang).toBe("fr");
  });

  it("manifest route uses the locale-specific marketing home for launch URLs", async () => {
    const res = await manifestGet(
      new Request("http://localhost:3000/manifest/en"),
      { params: Promise.resolve({ locale: "en" }) }
    );
    const body = (await res.json()) as {
      lang: string;
      scope: string;
      start_url: string;
    };

    expect(body.lang).toBe("en");
    expect(body.start_url).toBe("/en");
    expect(body.scope).toBe("/en");
  });
});
