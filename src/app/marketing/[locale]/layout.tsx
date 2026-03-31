import { notFound } from "next/navigation";

import { isSupportedLocale } from "@/shared/i18n/config";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const LocaleLayout = async ({ children, params }: Props) => {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return children;
};

export default LocaleLayout;
