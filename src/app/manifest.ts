import type { MetadataRoute } from "next";

import { PRODUCT_BRAND_NAME } from "@/shared/constants/brand";
import { getSiteUrl } from "@/shared/seo/siteUrl";

/**
 * Web app manifest (PWA install). Single default language string for the manifest spec.
 */
const manifest = (): MetadataRoute.Manifest => {
  const base = getSiteUrl();

  return {
    name: PRODUCT_BRAND_NAME,
    short_name: PRODUCT_BRAND_NAME,
    description:
      "Outil d'aide au couple pour réduire la charge mentale et clarifier le quotidien.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf7f4",
    theme_color: "#2a1f1a",
    icons: [
      {
        src: new URL("/icon", base).toString(),
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
};

export default manifest;
