import { redirect } from "next/navigation";

import { defaultLocale, isSupportedLocale } from "@/shared/i18n/config";
import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const Pricing = async ({ params }: PageProps) => {
  const { locale } = await params;
  const targetLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  redirect(buildMarketingHomePath(targetLocale));
};

export default Pricing;
