"use client";

import { useMemo } from "react";

import { createPluralKey } from "@/shared/i18n/dynamic";
import messagesEn from "@/shared/i18n/messages/en.json";
import messagesEs from "@/shared/i18n/messages/es.json";
import messagesFr from "@/shared/i18n/messages/fr.json";
import type {
  Locale,
  TranslationMessages,
  TranslationNode,
  TranslationValue,
} from "@/shared/i18n/types";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";
import { interpolateTranslation } from "@/shared/i18n/utils";

const messagesByLocale: Record<Locale, TranslationMessages> = {
  fr: messagesFr as TranslationMessages,
  en: messagesEn as TranslationMessages,
  es: messagesEs as TranslationMessages,
};

/**
 * Returns a translation getter bound to a namespace.
 */
export const useTranslation = (namespace: string) => {
  const locale = useLocaleStore((s) => s.locale);

  const messages = useMemo(
    () => messagesByLocale[locale] ?? messagesByLocale.fr,
    [locale]
  );

  const getNamespaceValue = (
    obj: Record<string, unknown>,
    path: string
  ): TranslationNode | undefined => {
    const parts = path.split(".");
    let current: unknown = obj;

    for (const part of parts) {
      if (
        current &&
        typeof current === "object" &&
        part in current &&
        typeof (current as Record<string, unknown>)[part] === "object"
      ) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    if (current && typeof current === "object") {
      return current as TranslationNode;
    }

    return undefined;
  };

  const namespaceMessages = useMemo(() => {
    return getNamespaceValue(
      messages as unknown as Record<string, unknown>,
      namespace
    );
  }, [messages, namespace]);

  return useMemo(() => {
    return (
      key: string,
      params?: Record<string, string | number> & { count?: number }
    ): string => {
      if (!namespaceMessages) {
        console.warn(`Namespace "${namespace}" not found in translations`);
        return key;
      }

      const getValueFromNamespace = (
        scopedKey: string
      ): TranslationValue | undefined => {
        const keyParts = scopedKey.split(".");
        let current: unknown = namespaceMessages;

        for (const part of keyParts) {
          if (
            current &&
            typeof current === "object" &&
            part in current &&
            typeof (current as Record<string, unknown>)[part] === "object"
          ) {
            current = (current as Record<string, unknown>)[part];
          } else if (
            current &&
            typeof current === "object" &&
            part in current &&
            typeof (current as Record<string, unknown>)[part] === "string"
          ) {
            return (current as Record<string, string>)[part];
          } else {
            return undefined;
          }
        }

        return typeof current === "string" ? current : undefined;
      };

      let translationKey = key;
      if (params && typeof params.count === "number") {
        const pluralKey = createPluralKey(key, params.count);
        const pluralValue = getValueFromNamespace(pluralKey);
        if (pluralValue && typeof pluralValue === "string") {
          translationKey = pluralKey;
        }
      }

      const translationValue = getValueFromNamespace(translationKey);

      if (!translationValue || typeof translationValue !== "string") {
        console.warn(
          `Translation key "${translationKey}" not found in namespace "${namespace}"`
        );
        return key;
      }

      if (params) {
        return interpolateTranslation(translationValue, params);
      }

      return translationValue;
    };
  }, [namespaceMessages, namespace]);
};
