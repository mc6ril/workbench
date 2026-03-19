"use client";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { useTranslation } from "@/shared/i18n";

/**
 * Loading state for project routes.
 */
const ProjectLoading = () => {
  const t = useTranslation("pages.fallback");

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
