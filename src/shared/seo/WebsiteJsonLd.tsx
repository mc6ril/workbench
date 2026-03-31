import { getMessages } from "@/shared/i18n/messages";
import { getRequestLocale } from "@/shared/i18n/requestLocale";
import { getTranslationValue } from "@/shared/i18n/utils";
import { getSiteUrl } from "@/shared/seo/siteUrl";

/**
 * Server-only JSON-LD for the marketing home page (WebSite + Organization).
 */
const WebsiteJsonLd = async () => {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const name = getTranslationValue(messages, "app.metadata", "title");
  const description = getTranslationValue(messages, "app.metadata", "description");
  const siteUrl = getSiteUrl().origin;

  if (!name || !description) {
    return null;
  }

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name,
        description,
        url: siteUrl,
        inLanguage: locale,
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "ReadAction",
          target: siteUrl,
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
        "@id": `${siteUrl}/#webapp`,
        name,
        description,
        url: siteUrl,
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
