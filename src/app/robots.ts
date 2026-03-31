import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/shared/seo/siteUrl";

const robots = (): MetadataRoute.Robots => {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/monitoring",
          "/auth/",
          "/workspace",
          "/account",
          "/join/",
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", base).toString(),
    host: base.host,
  };
};

export default robots;
