import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LandingPage from "@/presentation/pages/landing";

import { isSupportedLocale } from "@/shared/i18n/config";
import { buildHomeMetadata } from "@/shared/seo/homeMetadata";
import WebsiteJsonLd from "@/shared/seo/WebsiteJsonLd";

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

  return await buildHomeMetadata(locale);
};

const MarketingHomePage = async ({ params }: PageProps) => {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <>
      <WebsiteJsonLd locale={locale} />
      <LandingPage locale={locale} />
    </>
  );
};

export default MarketingHomePage;
