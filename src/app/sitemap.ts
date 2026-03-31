import type { MetadataRoute } from "next";

import { supportedLocales } from "@/shared/i18n/config";
import {
  buildMarketingHomePath,
  buildMarketingLegalPath,
  buildMarketingPricingPath,
} from "@/shared/i18n/marketingPaths";
import { getLanguageAlternates } from "@/shared/seo/languageAlternates";
import { getSiteUrl } from "@/shared/seo/siteUrl";

const marketingPaths: {
  buildPath: (locale: (typeof supportedLocales)[number]) => string;
  priority: number;
}[] = [
  { buildPath: buildMarketingHomePath, priority: 1 },
  { buildPath: buildMarketingPricingPath, priority: 0.8 },
  { buildPath: buildMarketingLegalPath, priority: 0.6 },
];

const sitemap = (): MetadataRoute.Sitemap => {
  const base = getSiteUrl();
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of supportedLocales) {
    for (const { buildPath, priority } of marketingPaths) {
      const path = buildPath(locale);
      entries.push({
        url: new URL(path, base).toString(),
        lastModified,
        changeFrequency: "weekly",
        priority,
        alternates: {
          languages: getLanguageAlternates(buildPath),
        },
      });
    }
  }

  return entries;
};

export default sitemap;
