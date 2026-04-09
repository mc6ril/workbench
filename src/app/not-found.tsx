import { getLocale, getTranslations } from "next-intl/server";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import type { Locale } from "@/shared/i18n";
import { buildMarketingHomePath } from "@/shared/i18n/marketingPaths";

const NotFoundPage = async () => {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({
    locale,
    namespace: "pages.fallback",
  });

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
          href: buildMarketingHomePath(locale),
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
