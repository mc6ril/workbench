import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { isSupportedLocale, supportedLocales } from "@/shared/i18n";
import RequestIntlProvider from "@/shared/providers/RequestIntlProvider";

export const revalidate = 300;
export const dynamicParams = false;
export const dynamic = "error";

export const generateStaticParams = () => {
  return supportedLocales.map((locale) => ({ locale }));
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const LocaleLayout = async ({ children, params }: Props) => {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <RequestIntlProvider>{children}</RequestIntlProvider>;
};

export default LocaleLayout;
