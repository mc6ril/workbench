import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { getServerTranslation } from "@/shared/i18n/server";

/**
 * Loading state for project routes.
 */
const ProjectLoading = async () => {
  const t = await getServerTranslation("pages.fallback");

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
