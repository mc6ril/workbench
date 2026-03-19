"use client";

import { useEffect } from "react";

import RouteFallbackPage from "@/shared/design-system/RouteFallbackPage";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: Props) => {
  const t = useTranslation("pages.fallback");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteFallbackPage
      tone="error"
      eyebrow={t("error.eyebrow")}
      statusLabel={t("error.status")}
      statusValue="500"
      title={t("error.title")}
      message={t("error.message")}
      detail={
        process.env.NODE_ENV === "development" ? error.message : undefined
      }
      actions={[
        {
          label: t("error.primaryAction"),
          ariaLabel: t("error.primaryActionAriaLabel"),
          onClick: reset,
          variant: "primary",
        },
        {
          label: t("error.secondaryAction"),
          ariaLabel: t("error.secondaryActionAriaLabel"),
          href: PAGE_ROUTES.HOME,
          variant: "secondary",
        },
      ]}
    />
  );
};

export default ErrorPage;
