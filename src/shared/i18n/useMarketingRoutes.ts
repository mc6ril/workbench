"use client";

import {
  buildMarketingHomePath,
  buildMarketingLegalPath,
  buildMarketingPricingPath,
} from "@/shared/i18n/marketingPaths";
import { useLocaleStore } from "@/shared/i18n/useLocaleStore";

/**
 * Locale-prefixed marketing URLs for client components (landing, workspace footer, etc.).
 */
export const useMarketingRoutes = () => {
  const locale = useLocaleStore((state) => state.locale);

  return {
    home: buildMarketingHomePath(locale),
    pricing: buildMarketingPricingPath(locale),
    legal: buildMarketingLegalPath(locale),
  };
};
