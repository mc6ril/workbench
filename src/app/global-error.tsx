"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import * as Sentry from "@sentry/nextjs";

import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { getIntlLocale, useTranslations } from "@/shared/i18n";
import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";
import { messageCatalog } from "@/shared/i18n/messageCatalog";
import {
  getBrowserAcceptLanguage,
  resolveRuntimeLocale,
} from "@/shared/i18n/runtimeLocale";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const subscribeToRuntimeLocale = () => {
  return () => {};
};

const getServerSnapshot = (pathname: string | null) => {
  return resolveRuntimeLocale({ pathname });
};

const getClientSnapshot = (pathname: string | null) => {
  return resolveRuntimeLocale({
    pathname,
    cookieString: document.cookie,
    acceptLanguage: getBrowserAcceptLanguage(),
  });
};

const GlobalErrorContent = ({
  error,
  reset,
  locale,
}: Props & { locale: ReturnType<typeof getServerSnapshot> }) => {
  const t = useTranslations("pages.fallback");
  const homePath = buildMarketingHomePath(locale);

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
          href: homePath,
          variant: "secondary",
        },
      ]}
    />
  );
};

const GlobalErrorPage = ({ error, reset }: Props) => {
  const pathname = usePathname();
  const locale = useSyncExternalStore(
    subscribeToRuntimeLocale,
    () => getClientSnapshot(pathname),
    () => getServerSnapshot(pathname)
  );

  return (
    <html lang={getIntlLocale(locale)} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider
          locale={locale}
          messages={messageCatalog[locale]}
        >
          <GlobalErrorContent error={error} reset={reset} locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
