import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { assertDefined } from "@/shared/errors/programmingError";
import { resolveLocale } from "@/shared/i18n/config";
import {
  buildMarketingHomePath,
  buildMarketingPricingPath,
} from "@/shared/i18n/marketingPaths";
import { getMessages } from "@/shared/i18n/messages";
import type { Locale } from "@/shared/i18n/types";
import { getTranslationValue } from "@/shared/i18n/utils";
import AppProvider from "@/shared/providers/AppProvider";
import { buildPublicMetadata } from "@/shared/seo/buildPublicMetadata";

import { getCachedBillingVisibility } from "@/domains/billing/infrastructure/server/getCachedBillingVisibility";
import PricingPage from "@/domains/billing/presentation/pages/pricing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { locale: routeLocale } = await params;
  const locale: Locale = resolveLocale({ preferredLocale: routeLocale });
  const messages = getMessages(locale);
  const title = getTranslationValue(messages, "pages.pricing", "metadata.title");
  const description = getTranslationValue(
    messages,
    "pages.pricing",
    "metadata.description"
  );

  assertDefined(title, "Missing translation: pages.pricing.metadata.title");
  assertDefined(
    description,
    "Missing translation: pages.pricing.metadata.description"
  );

  return buildPublicMetadata({
    locale,
    title,
    description,
    pathname: buildMarketingPricingPath(locale),
    buildPathForLocale: buildMarketingPricingPath,
  });
};

const Pricing = async ({ params }: PageProps) => {
  const { locale: routeLocale } = await params;
  const locale: Locale = resolveLocale({ preferredLocale: routeLocale });
  const isBillingVisible = await getCachedBillingVisibility();

  if (!isBillingVisible) {
    redirect(buildMarketingHomePath(locale));
  }

  return (
    <AppProvider>
      <PricingPage />
    </AppProvider>
  );
};

export default Pricing;
