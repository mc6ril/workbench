"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { getIntlLocale, useLocaleStore, useTranslation } from "@/shared/i18n";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalErrorPage = ({ error, reset }: Props) => {
  const t = useTranslation("pages.fallback");
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    console.error(error);
    if (error.digest) {
      Sentry.captureException(error, {
        tags: { nextDigest: error.digest },
      });
    } else {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang={getIntlLocale(locale)}>
      <body>
        <RouteFallbackPage
          tone="error"
          eyebrow={t("globalError.eyebrow")}
          statusLabel={t("globalError.status")}
          statusValue="500"
          title={t("globalError.title")}
          message={t("globalError.message")}
          detail={
            process.env.NODE_ENV === "development" ? error.message : undefined
          }
          actions={[
            {
              label: t("globalError.primaryAction"),
              ariaLabel: t("globalError.primaryActionAriaLabel"),
              onClick: reset,
              variant: "primary",
            },
            {
              label: t("globalError.secondaryAction"),
              ariaLabel: t("globalError.secondaryActionAriaLabel"),
              href: PAGE_ROUTES.HOME,
              variant: "secondary",
            },
          ]}
        />
      </body>
    </html>
  );
};

export default GlobalErrorPage;
