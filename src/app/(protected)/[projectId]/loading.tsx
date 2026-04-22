"use client";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { useTranslations } from "@/shared/i18n";

export const ProjectLoading = () => {
  const t = useTranslations("pages.fallback");

  return (
    <RouteFallbackPage
      tone="loading"
      eyebrow={t("projectLoading.eyebrow")}
      statusLabel={t("projectLoading.status")}
      title={t("projectLoading.title")}
      message={t("projectLoading.message")}
      ariaLabel={t("projectLoading.ariaLabel")}
    />
  );
};

export default ProjectLoading;
