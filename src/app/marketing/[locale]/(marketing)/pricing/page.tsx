import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { defaultLocale, isSupportedLocale } from "@/shared/i18n/config";
import {
  buildMarketingHomePath,
  buildMarketingPricingPath,
} from "@/shared/i18n/marketingPaths";
import { getStaticTranslator } from "@/shared/i18n/staticTranslator";
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
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const tMetadata = getStaticTranslator(locale, "pages.pricing.metadata");

  return buildPublicMetadata({
    locale,
    title: tMetadata("title"),
    description: tMetadata("description"),
    pathname: buildMarketingPricingPath(locale),
    buildPathForLocale: buildMarketingPricingPath,
  });
};

const Pricing = async ({ params }: PageProps) => {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    redirect(buildMarketingHomePath(defaultLocale));
  }

  const isBillingVisible = await getCachedBillingVisibility();

  if (!isBillingVisible) {
    redirect(buildMarketingHomePath(locale));
  }

  return (
    <AppProvider>
      <Suspense fallback={null}>
        <PricingPage />
      </Suspense>
    </AppProvider>
  );
};

export default Pricing;
