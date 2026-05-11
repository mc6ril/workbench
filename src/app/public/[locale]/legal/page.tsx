import type { Metadata } from "next";

import LegalPage from "@/presentation/pages/legal";

import type { Locale } from "@/shared/i18n";
import { isSupportedLocale } from "@/shared/i18n/config";
import { buildLegalPath } from "@/shared/i18n/publicPaths";
import { getStaticTranslator } from "@/shared/i18n/staticTranslator";
import { buildPublicMetadata } from "@/shared/seo/buildPublicMetadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const tMetadata = getStaticTranslator(locale, "pages.legal.metadata");

  return buildPublicMetadata({
    locale,
    title: tMetadata("title"),
    description: tMetadata("description"),
    pathname: buildLegalPath(locale),
    buildPathForLocale: buildLegalPath,
  });
};

const Legal = async ({ params }: Props) => {
  const { locale } = await params;
  return <LegalPage locale={locale} />;
};

export default Legal;
