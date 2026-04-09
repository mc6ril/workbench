import { getTranslations } from "next-intl/server";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";

/**
 * Loading state for project routes.
 */
const ProjectLoading = async () => {
  const t = await getTranslations("pages.fallback");

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
