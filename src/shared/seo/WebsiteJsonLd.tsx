import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";
import { getMessages } from "@/shared/i18n/messages";
import type { Locale } from "@/shared/i18n/types";
import { getTranslationValue } from "@/shared/i18n/utils";
import { getSiteUrl } from "@/shared/seo/siteUrl";

/**
 * Server-only JSON-LD for the marketing home page (WebSite + Organization).
 */
const WebsiteJsonLd = ({ locale }: { locale: Locale }) => {
  const messages = getMessages(locale);
  const name = getTranslationValue(messages, "app.metadata", "title");
  const description = getTranslationValue(messages, "app.metadata", "description");
  const base = getSiteUrl();
  const siteUrl = base.origin;
  const homeUrl = new URL(buildMarketingHomePath(locale), base).toString();

  if (!name || !description) {
    return null;
  }

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        name,
        description,
        url: homeUrl,
        inLanguage: locale,
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "ReadAction",
          target: homeUrl,
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name,
        url: siteUrl,
      },
      {
        "@type": "WebApplication",
        "@id": `${homeUrl}#webapp`,
        name,
        description,
        url: homeUrl,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        inLanguage: locale,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
};

export default WebsiteJsonLd;
