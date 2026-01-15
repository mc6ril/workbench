"use client";

import { useMemo } from "react";

import { getLocale } from "@/shared/i18n/config";
import { createPluralKey } from "@/shared/i18n/dynamic";
import messagesFr from "@/shared/i18n/messages/fr.json";
import type { TranslationMessages, TranslationNode, TranslationValue } from "@/shared/i18n/types";
import { interpolateTranslation } from "@/shared/i18n/utils";

/**
 * Simple translation function that returns a function to get translations from a namespace.
 * Supports interpolation, pluralization, and nested keys.
 *
 * @param namespace - The namespace to use (e.g., "common", "pages.signup")
 * @returns A function that takes a key and returns the translated string
 *
 * @example
 * ```tsx
 * const t = useTranslation("common");
 * t("loading"); // "Chargement en cours..."
 * t("welcome", { name: "John" }); // "Bienvenue, John!"
 * ```
 */
export const useTranslation = (namespace: string) => {
  const locale = getLocale();

  // Get messages for current locale
  const messages = useMemo(() => {
    switch (locale) {
      case "fr":
        return messagesFr as TranslationMessages;
      default:
        return messagesFr as TranslationMessages;
    }
  }, [locale]);

  // Navigate through the namespace path
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

      // Helper function to get value from namespaceMessages
      const getValueFromNamespace = (
        k: string
      ): TranslationValue | undefined => {
        const keyParts = k.split(".");
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

      // Handle pluralization: if params contains 'count', try pluralized key first
      let translationKey = key;
      if (params && typeof params.count === "number") {
        const pluralKey = createPluralKey(key, params.count);
        // Try pluralized key first, fallback to base key
        const pluralValue = getValueFromNamespace(pluralKey);
        if (pluralValue && typeof pluralValue === "string") {
          translationKey = pluralKey;
        }
      }

      // Get translation value
      const translationValue = getValueFromNamespace(translationKey);

      if (!translationValue || typeof translationValue !== "string") {
        console.warn(
          `Translation key "${translationKey}" not found in namespace "${namespace}"`
        );
        return key;
      }

      // Interpolate translation using utility function
      // Filter out 'count' parameter as it's only used for pluralization, not interpolation
      if (params) {
        const { count: _count, ...interpolationParams } = params;
        if (Object.keys(interpolationParams).length > 0) {
          return interpolateTranslation(translationValue, interpolationParams);
        }
      }

      return translationValue;
    };
  }, [namespaceMessages, namespace]);
};
