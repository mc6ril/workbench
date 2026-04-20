import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { defaultLocale, getIntlLocale } from "@/shared/i18n";
import { getSiteUrl } from "@/shared/seo/siteUrl";

import "@/styles/global.scss";

/**
 * Per-locale SEO for marketing lives under `[locale]/(marketing)/*` via `buildHomeMetadata` / `buildPublicMetadata`.
 * Web app manifest is locale-aware for all routes.
 */
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  // Locale-specific manifests are set on marketing routes; keep root metadata static for SSG.
  manifest: new URL(`/manifest/${defaultLocale}`, siteUrl).toString(),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#2a1f1a" },
  ],
  viewportFit: "cover",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang={getIntlLocale(defaultLocale)} suppressHydrationWarning>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
