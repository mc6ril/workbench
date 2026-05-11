"use client";

import { useLocale } from "@/shared/i18n";
import { buildHomePath, buildLegalPath } from "@/shared/i18n/publicPaths";

export const usePublicRoutes = () => {
  const locale = useLocale();

  return {
    home: buildHomePath(locale),
    legal: buildLegalPath(locale),
  };
};
