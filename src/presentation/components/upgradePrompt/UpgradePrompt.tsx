"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { PlanFeature } from "@/core/domain/rules/planFeatures.rules";
import type { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import Button from "@/shared/design-system/Button";
import Text from "@/shared/design-system/Text";
import Title from "@/shared/design-system/Title";

import { getAccessibilityId } from "@/shared/a11y";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";

import styles from "./UpgradePrompt.module.scss";

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
  const t = useTranslation("pages.upgrade");
  const headingId = useMemo(
    () => getAccessibilityId("upgrade-prompt-title"),
    []
  );

  const featureName = t(`featureNames.${feature}`);
  const planBadge = t(`planBadges.${minimumPlan}`);

  const handleViewPlans = useCallback(() => {
    const from = encodeURIComponent(pathname ?? PAGE_ROUTES.WORKSPACE);
    router.push(`${PAGE_ROUTES.PRICING}?from=${from}`);
  }, [router, pathname]);

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

        <Button
          label={t("ctaLabel")}
          variant="primary"
          onClick={handleViewPlans}
          aria-label={t("ctaAriaLabel")}
        />
      </div>
    </section>
  );
};

export default React.memo(UpgradePrompt);
