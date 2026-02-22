import { create } from "zustand";

import type { Locale } from "@/shared/i18n/types";

type LocaleState = {
  /** Active locale used by the translation system. */
  locale: Locale;
};

type LocaleActions = {
  setLocale: (locale: Locale) => void;
};

type LocaleStore = LocaleState & LocaleActions;

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: "fr",
  setLocale: (locale: Locale): void => {
    set({ locale });
  },
}));
