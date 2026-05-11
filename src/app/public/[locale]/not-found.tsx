"use client";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import RouteFallbackPage from "@/shared/design-system/route_fallback_page";
import { getFallbackMessages } from "@/shared/i18n/fallbackMessages";
import { buildHomePath } from "@/shared/i18n/publicPaths";
import { useRuntimeLocaleSnapshot } from "@/shared/i18n/useRuntimeLocaleSnapshot";

const PublicNotFoundPage = () => {
  const locale = useRuntimeLocaleSnapshot();
  const copy = getFallbackMessages(locale).notFound;

  return (
    <RouteFallbackPage
      tone="notFound"
      eyebrow={copy.eyebrow}
      statusLabel={copy.status}
      statusValue="404"
      title={copy.title}
      message={copy.message}
      actions={[
        {
          label: copy.primaryAction,
          ariaLabel: copy.primaryActionAriaLabel,
          href: buildHomePath(locale),
          variant: "primary",
        },
        {
          label: copy.secondaryAction,
          ariaLabel: copy.secondaryActionAriaLabel,
          href: PAGE_ROUTES.WORKSPACE,
          variant: "secondary",
        },
      ]}
    />
  );
};

export default PublicNotFoundPage;
