"use client";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { useTranslations } from "@/shared/i18n";

export const WorkspaceLoadingContent = () => {
  const t = useTranslations("pages.fallback");

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

/**
 * Loading state for workspace route.
 */
const WorkspaceLoading = () => {
  return <WorkspaceLoadingContent />;
};

export default WorkspaceLoading;
