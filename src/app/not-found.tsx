"use client";

import RouteFallbackPage from "@/presentation/components/feedback/RouteFallbackPage";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";

const NotFoundPage = () => {
  const t = useTranslation("pages.fallback");

  return (
    <RouteFallbackPage
      tone="notFound"
      eyebrow={t("notFound.eyebrow")}
      statusLabel={t("notFound.status")}
      statusValue="404"
      title={t("notFound.title")}
      message={t("notFound.message")}
      actions={[
        {
          label: t("notFound.primaryAction"),
          ariaLabel: t("notFound.primaryActionAriaLabel"),
          href: PAGE_ROUTES.HOME,
          variant: "primary",
        },
        {
          label: t("notFound.secondaryAction"),
          ariaLabel: t("notFound.secondaryActionAriaLabel"),
          href: PAGE_ROUTES.WORKSPACE,
          variant: "secondary",
        },
      ]}
    />
  );
};

export default NotFoundPage;
