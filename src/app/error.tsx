"use client";

import { useEffect } from "react";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { useLocale, useTranslations } from "@/shared/i18n";
import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: Props) => {
  const locale = useLocale();
  const t = useTranslations("pages.fallback");
  const homePath = buildMarketingHomePath(locale);

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
          href: homePath,
          variant: "secondary",
        },
      ]}
    />
  );
};

export default ErrorPage;
