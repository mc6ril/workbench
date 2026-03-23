import messagesEn from "@/shared/i18n/messages/en.json";
import messagesEs from "@/shared/i18n/messages/es.json";
import messagesFr from "@/shared/i18n/messages/fr.json";

import { defaultLocale } from "./config";
import type { Locale, TranslationMessages } from "./types";

export const messagesByLocale = {
  fr: messagesFr as TranslationMessages,
  en: messagesEn as TranslationMessages,
  es: messagesEs as TranslationMessages,
} satisfies Record<Locale, TranslationMessages>;

export const getMessages = (locale: Locale): TranslationMessages => {
  return messagesByLocale[locale] ?? messagesByLocale[defaultLocale];
};
