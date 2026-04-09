import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { getIntlLocale, type Locale } from "@/shared/i18n";
import { getSiteUrl } from "@/shared/seo/siteUrl";

import "@/styles/global.scss";

/**
 * Per-locale SEO for marketing lives under `[locale]/(marketing)/*` via `buildHomeMetadata` / `buildPublicMetadata`.
 * Web app manifest is locale-aware for all routes.
 */
export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  const siteUrl = getSiteUrl();

  return {
    metadataBase: siteUrl,
    manifest: new URL(`/manifest/${locale}`, siteUrl).toString(),
  };
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#2a1f1a" },
  ],
  viewportFit: "cover",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();

  return (
    <html lang={getIntlLocale(locale)} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="app-root">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
