import { cache } from "react";

import { createPluralKey } from "./dynamic";
import { getMessages } from "./messages";
import { getRequestLocale } from "./requestLocale";
import type { TranslationFunction, TranslationParams } from "./types";
import { getTranslationValue, interpolateTranslation } from "./utils";

import "server-only";

export const getServerTranslation = cache(
  async (namespace: string): Promise<TranslationFunction> => {
    const locale = await getRequestLocale();
    const messages = getMessages(locale);

    return (key: string, params?: TranslationParams): string => {
      let translationKey = key;

      if (params && typeof params.count === "number") {
        const pluralKey = createPluralKey(key, params.count);
        if (getTranslationValue(messages, namespace, pluralKey)) {
          translationKey = pluralKey;
        }
      }

      const translationValue = getTranslationValue(
        messages,
        namespace,
        translationKey
      );

      if (!translationValue) {
        console.warn(
          `Translation key "${translationKey}" not found in namespace "${namespace}"`
        );
        return key;
      }

      return params
        ? interpolateTranslation(translationValue, params)
        : translationValue;
    };
  }
);
