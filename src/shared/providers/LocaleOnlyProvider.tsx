"use client";

import { useEffect } from "react";

import { registerLocaleGetter } from "@/shared/i18n/config";
import { LocaleProvider } from "@/shared/i18n/LocaleProvider";
import type { Locale } from "@/shared/i18n/types";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";

type LocaleOnlyProviderProps = {
  initialLocale: Locale;
  children: React.ReactNode;
};

const LocaleRegistration = () => {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    registerLocaleGetter(() => locale);
  }, [locale]);

  return null;
};

const LocaleOnlyProvider = ({
  initialLocale,
  children,
}: LocaleOnlyProviderProps) => {
  return (
    <LocaleProvider key={initialLocale} initialLocale={initialLocale}>
      <LocaleRegistration />
      {children}
    </LocaleProvider>
  );
};

export default LocaleOnlyProvider;
