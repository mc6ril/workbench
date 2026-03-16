"use client";

import RouteFallbackPage from "@/presentation/components/feedback/RouteFallbackPage";

import { useTranslation } from "@/shared/i18n";

/**
 * Loading state for workspace route.
 */
const WorkspaceLoading = () => {
  const t = useTranslation("pages.fallback");

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
