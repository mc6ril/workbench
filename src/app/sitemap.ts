import type { MetadataRoute } from "next";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { getLanguageAlternates } from "@/shared/seo/languageAlternates";
import { getSiteUrl } from "@/shared/seo/siteUrl";

const sitemap = (): MetadataRoute.Sitemap => {
  const base = getSiteUrl();
  const lastModified = new Date();

  const paths: { path: string; priority: number }[] = [
    { path: PAGE_ROUTES.HOME, priority: 1 },
    { path: PAGE_ROUTES.PRICING, priority: 0.8 },
    { path: PAGE_ROUTES.LEGAL, priority: 0.6 },
  ];

  return paths.map(({ path, priority }) => ({
    url: new URL(path, base).toString(),
    lastModified,
    changeFrequency: "weekly",
    priority,
    alternates: {
      languages: getLanguageAlternates(path),
    },
  }));
};

export default sitemap;
