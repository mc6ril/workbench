import { notFound } from "next/navigation";

import { isSupportedLocale } from "@/shared/i18n/config";
import LocaleOnlyProvider from "@/shared/providers/LocaleOnlyProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const LocaleLayout = async ({ children, params }: Props) => {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <LocaleOnlyProvider initialLocale={locale}>
      {children}
    </LocaleOnlyProvider>
  );
};

export default LocaleLayout;
