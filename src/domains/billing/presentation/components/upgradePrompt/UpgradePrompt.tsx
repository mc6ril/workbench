"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/button";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";
import { useMarketingRoutes } from "@/shared/i18n/useMarketingRoutes";

import styles from "./UpgradePrompt.module.scss";

import type { PlanFeature } from "@/domains/billing/core/domain/planFeatures.rules";
import type { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import { useBillingVisibility } from "@/domains/billing/presentation/hooks/useBillingVisibility";

type Props = {
  feature: PlanFeature;
  minimumPlan: SubscriptionPlan;
};

/**
 * Full-section prompt shown when a feature is locked behind a higher plan.
 * Displays the feature name, required plan, and a CTA to the pricing page.
 */
const UpgradePrompt = ({ feature, minimumPlan }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { pricing } = useMarketingRoutes();
  const t = useTranslations("pages.upgrade");
  const { data: isBillingVisible } = useBillingVisibility();
  const headingId = useMemo(
    () => getAccessibilityId("upgrade-prompt-title"),
    []
  );

  const featureName = t(`featureNames.${feature}`);
  const planBadge = t(`planBadges.${minimumPlan}`);

  const handleViewPlans = useCallback(() => {
    const from = encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE);
    router.push(`${pricing}?from=${from}`);
  }, [router, pathname, pricing]);

  return (
    <section
      className={styles["upgrade-prompt"]}
      aria-labelledby={headingId}
      role="status"
    >
      <div className={styles["upgrade-prompt__content"]}>
        <span className={styles["upgrade-prompt__icon"]} aria-hidden="true">
          🔒
        </span>

        <Title
          id={headingId}
          variant="h2"
          className={styles["upgrade-prompt__title"]}
        >
          {t("title").replace("{plan}", planBadge)}
        </Title>

        <Text variant="small" className={styles["upgrade-prompt__description"]}>
          {t("description").replace("{plan}", planBadge)}
        </Text>

        <div className={styles["upgrade-prompt__feature-badge"]}>
          <span className={styles["upgrade-prompt__feature-name"]}>
            {featureName}
          </span>
          <span className={styles["upgrade-prompt__plan-badge"]}>
            {planBadge}
          </span>
        </div>

        {isBillingVisible && (
          <Button
            label={t("ctaLabel")}
            variant="primary"
            onClick={handleViewPlans}
            aria-label={t("ctaAriaLabel")}
          />
        )}
      </div>
    </section>
  );
};

export default React.memo(UpgradePrompt);
