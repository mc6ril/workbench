import type { Metadata, Viewport } from "next";

import { PRODUCT_BRAND_NAME } from "@/shared/constants/brand";
import { assertDefined } from "@/shared/errors/programmingError";
import { getIntlLocale, getTranslationValue } from "@/shared/i18n";
import { getMessages } from "@/shared/i18n/messages";
import { getRequestLocale } from "@/shared/i18n/requestLocale";
import AppProvider from "@/shared/providers/AppProvider";
import { getLanguageAlternates } from "@/shared/seo/languageAlternates";
import {
  getAlternateOpenGraphLocales,
  getOpenGraphLocale,
} from "@/shared/seo/ogLocale";
import { getSiteUrl } from "@/shared/seo/siteUrl";

import "@/styles/global.scss";

const getAppMetadata = async (): Promise<Metadata> => {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const siteUrl = getSiteUrl();

  const appTitle = getTranslationValue(messages, "app.metadata", "title");
  const appDescription = getTranslationValue(
    messages,
    "app.metadata",
    "description"
  );
  assertDefined(appTitle, "Missing translation: app.metadata.title");
  assertDefined(appDescription, "Missing translation: app.metadata.description");

  const titleTemplate =
    getTranslationValue(messages, "app.metadata", "titleTemplate") ??
    `%s | ${PRODUCT_BRAND_NAME}`;
  const keywordsRaw = getTranslationValue(messages, "app.metadata", "keywords");
  const ogImageAlt =
    getTranslationValue(messages, "app.metadata", "ogImageAlt") ?? appTitle;

  const keywords =
    keywordsRaw
      ?.split(",")
      .map((k) => k.trim())
      .filter(Boolean) ?? [];

  const ogLocale = getOpenGraphLocale(locale);
  const alternateOgLocales = getAlternateOpenGraphLocales(locale);
  const homeUrl = new URL("/", siteUrl).toString();
  const manifestUrl = new URL(`/manifest/${locale}`, siteUrl).toString();

  return {
    metadataBase: siteUrl,
    title: {
      default: appTitle,
      template: titleTemplate,
    },
    description: appDescription,
    keywords,
    applicationName: appTitle,
    authors: [{ name: appTitle, url: siteUrl.origin }],
    creator: appTitle,
    manifest: manifestUrl,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: homeUrl,
      languages: getLanguageAlternates("/"),
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale: alternateOgLocales,
      url: homeUrl,
      siteName: appTitle,
      title: appTitle,
      description: appDescription,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: ogImageAlt ?? appTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: appTitle,
      description: appDescription,
      images: ["/opengraph-image"],
    },
    category: "productivity",
  };
};

export const generateMetadata = async (): Promise<Metadata> => {
  return getAppMetadata();
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
  const locale = await getRequestLocale();

  return (
    <html lang={getIntlLocale(locale)} suppressHydrationWarning>
      <body>
        <AppProvider initialLocale={locale}>
          <div className="app-root">{children}</div>
        </AppProvider>
      </body>
    </html>
  );
};

export default RootLayout;
