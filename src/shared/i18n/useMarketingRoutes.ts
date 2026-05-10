"use client";

import { useLocale } from "@/shared/i18n";
import {
  buildMarketingHomePath,
  buildMarketingLegalPath,
} from "@/shared/i18n/marketingPaths";

/**
 * Locale-prefixed marketing URLs for client components (landing, workspace footer, etc.).
 */
export const useMarketingRoutes = () => {
  const locale = useLocale();

  return {
    home: buildMarketingHomePath(locale),
    legal: buildMarketingLegalPath(locale),
  };
};
