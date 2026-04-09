import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { isSupportedLocale } from "@/shared/i18n/config";
import { buildMarketingLegalPath } from "@/shared/i18n/marketingPaths";
import { buildPublicMetadata } from "@/shared/seo/buildPublicMetadata";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const tMetadata = await getTranslations({
    locale,
    namespace: "pages.legal.metadata",
  });

  return buildPublicMetadata({
    locale,
    title: tMetadata("title"),
    description: tMetadata("description"),
    pathname: buildMarketingLegalPath(locale),
    buildPathForLocale: buildMarketingLegalPath,
  });
};

type Props = {
  children: ReactNode;
};

const LegalLayout = ({ children }: Props) => {
  return <>{children}</>;
};

export default LegalLayout;
