"use client";

import { useContext } from "react";

import { defaultLocale } from "@/shared/i18n/config";
import {
  LocaleStoreContext,
  type LocaleStoreValue,
} from "@/shared/i18n/LocaleProvider";

const fallbackLocaleStore: LocaleStoreValue = {
  locale: defaultLocale,
  setLocale: () => {},
};

/**
 * Small selector-based locale hook kept compatible with the previous API.
 */
export const useLocaleStore = <T>(
  selector: (store: LocaleStoreValue) => T
): T => {
  const store = useContext(LocaleStoreContext) ?? fallbackLocaleStore;
  return selector(store);
};
