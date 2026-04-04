import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { getServerTranslation } from "@/shared/i18n/server";

/**
 * Loading state for workspace route.
 */
const WorkspaceLoading = async () => {
  const t = await getServerTranslation("pages.fallback");

  return (
    <RouteFallbackPage
      tone="loading"
      eyebrow={t("workspaceLoading.eyebrow")}
      statusLabel={t("workspaceLoading.status")}
      title={t("workspaceLoading.title")}
      message={t("workspaceLoading.message")}
      ariaLabel={t("workspaceLoading.ariaLabel")}
    />
  );
};

export default WorkspaceLoading;
