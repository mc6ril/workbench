"use client";

import { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import * as Sentry from "@sentry/nextjs";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { defaultLocale, getIntlLocale, useTranslations } from "@/shared/i18n";
import messages from "@/shared/i18n/messages/fr.json";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalErrorContent = ({ error, reset }: Props) => {
  const t = useTranslations("pages.fallback");

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
  );
};

const GlobalErrorPage = ({ error, reset }: Props) => {
  return (
    <html lang={getIntlLocale(defaultLocale)} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={defaultLocale} messages={messages}>
          <GlobalErrorContent error={error} reset={reset} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
