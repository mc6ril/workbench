"use client";

import { useMemo } from "react";

import { getLocale } from "@/shared/i18n/config";
import messagesFr from "@/shared/i18n/messages/fr.json";
import type { TranslationMessages } from "@/shared/i18n/types";

/**
 * Simple translation function that returns a function to get translations from a namespace.
 *
 * @param namespace - The namespace to use (e.g., "common", "pages.signup")
 * @returns A function that takes a key and returns the translated string
 */
export function useTranslation(namespace: string) {
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
  ): Record<string, string | Record<string, unknown>> | undefined => {
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
      return current as Record<string, string | Record<string, unknown>>;
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
    return (key: string, params?: Record<string, string | number>): string => {
      if (!namespaceMessages) {
        console.warn(`Namespace "${namespace}" not found in translations`);
        return key;
      }

      // Handle nested keys like "errors.invalidEmail"
      const keyParts = key.split(".");
      let translationValue: string | Record<string, unknown> | undefined =
        namespaceMessages;

      for (const part of keyParts) {
        if (
          translationValue &&
          typeof translationValue === "object" &&
          part in translationValue
        ) {
          translationValue = (
            translationValue as Record<string, string | Record<string, unknown>>
          )[part];
        } else {
          console.warn(
            `Translation key "${key}" not found in namespace "${namespace}"`
          );
          return key;
        }
      }

      // If the value is an object, it's not a valid translation
      if (typeof translationValue !== "string") {
        console.warn(
          `Translation key "${key}" in namespace "${namespace}" is not a string`
        );
        return key;
      }

      let translation = translationValue;

      // Simple interpolation: replace {key} with values from params
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translation = translation.replace(
            new RegExp(`\\{${paramKey}\\}`, "g"),
            String(paramValue)
          );
        });
      }

      return translation;
    };
  }, [namespaceMessages, namespace]);
}

