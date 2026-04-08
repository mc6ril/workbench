import { getTranslations } from "next-intl/server";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";

const NotFoundPage = async () => {
  const t = await getTranslations("pages.fallback");

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
