import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { getIntlLocale, isSupportedLocale, supportedLocales } from "@/shared/i18n";
import { getStaticMessages } from "@/shared/i18n/staticTranslator";
import DocumentLang from "@/shared/providers/DocumentLang";

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

  const messages = getStaticMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DocumentLang lang={getIntlLocale(locale)} />
      <div className="app-root" lang={getIntlLocale(locale)}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
};

export default LocaleLayout;
