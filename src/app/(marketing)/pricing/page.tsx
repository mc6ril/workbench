import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import Loader from "@/shared/design-system/loader";
import { assertDefined } from "@/shared/errors/programmingError";
import { getMessages } from "@/shared/i18n/messages";
import { getRequestLocale } from "@/shared/i18n/requestLocale";
import { getTranslationValue } from "@/shared/i18n/utils";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { buildPublicMetadata } from "@/shared/seo/buildPublicMetadata";

import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { createBillingVisibilityPort } from "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase";
import PricingPage from "@/domains/billing/presentation/pages/pricing";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getRequestLocale();
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
    pathname: PAGE_ROUTES.PRICING,
  });
};

const Pricing = async () => {
  const supabaseClient = await createSupabaseServerClient();
  const billingVisibilityPort = createBillingVisibilityPort(supabaseClient);
  const isBillingVisible = await getBillingVisibility(billingVisibilityPort);

  if (!isBillingVisible) {
    redirect(PAGE_ROUTES.HOME);
  }

  return (
    <Suspense fallback={<Loader />}>
      <PricingPage />
    </Suspense>
  );
};

export default Pricing;
