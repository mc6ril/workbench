"use client";

import { createContext, useEffect, useMemo, useState } from "react";

import { getIntlLocale } from "./config";
import type { Locale } from "./types";

export type LocaleStoreValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const LocaleStoreContext = createContext<LocaleStoreValue | null>(null);

type Props = Readonly<{
  children: React.ReactNode;
  initialLocale: Locale;
}>;

/**
 * Provides the active locale for the current request and keeps the document
 * language synchronized after hydration.
 */
export const LocaleProvider = ({ children, initialLocale }: Props) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = getIntlLocale(locale);
  }, [locale]);

  const store = useMemo<LocaleStoreValue>(
    () => ({
      locale,
      setLocale,
    }),
    [locale]
  );

  return (
    <LocaleStoreContext.Provider value={store}>
      {children}
    </LocaleStoreContext.Provider>
  );
};
