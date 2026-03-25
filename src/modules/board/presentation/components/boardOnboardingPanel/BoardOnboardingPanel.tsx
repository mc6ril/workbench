"use client";

import { useMemo } from "react";

import { getAccessibilityId } from "@/shared/a11y";
import Badge from "@/shared/design-system/badge";
import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import ErrorMessage from "@/shared/design-system/error_message";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import styles from "./BoardOnboardingPanel.module.scss";
import type {
  OnboardingPanelProps,
  OnboardingProgressStepStatus,
} from "./onboarding.types";
import { ONBOARDING_STEP_STATUS } from "./onboarding.types";

const STATUS_BADGE_VARIANTS: Record<
  OnboardingProgressStepStatus,
  "success" | "warning" | "default"
> = {
  [ONBOARDING_STEP_STATUS.COMPLETE]: "success",
  [ONBOARDING_STEP_STATUS.CURRENT]: "warning",
  [ONBOARDING_STEP_STATUS.PENDING]: "default",
};

const BoardOnboardingPanel = ({
  isExpanded,
  steps,
  onReviewGuide,
  onHideGuide,
  onSkipOnboarding,
  isSkipPending = false,
  errorMessage,
  translationNamespace = "pages.board.onboarding",
}: OnboardingPanelProps) => {
  const t = useTranslation(translationNamespace);
  const titleId = useMemo(
    () => getAccessibilityId("board-onboarding-panel-title"),
    []
  );

  if (!isExpanded) {
    return (
      <section
        className={`${styles["board-onboarding-panel"]} ${styles["board-onboarding-panel--compact"]}`}
        aria-labelledby={titleId}
      >
        <div className={styles["board-onboarding-panel__header"]}>
          <div className={styles["board-onboarding-panel__header-text"]}>
            <div className={styles["board-onboarding-panel__eyebrow"]}>
              {t("eyebrow")}
            </div>
            <Title
              id={titleId}
              variant="h2"
              className={styles["board-onboarding-panel__title"]}
            >
              {t("reviewTitle")}
            </Title>
            <Text
              variant="small"
              className={styles["board-onboarding-panel__description"]}
            >
              {t("reviewDescription")}
            </Text>
          </div>
          <Button
            label={t("reviewCta")}
            aria-label={t("reviewCtaAriaLabel")}
            variant="secondary"
            onClick={onReviewGuide}
          />
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles["board-onboarding-panel"]} ${styles["board-onboarding-panel--expanded"]}`}
      aria-labelledby={titleId}
    >
      <div className={styles["board-onboarding-panel__header"]}>
        <div className={styles["board-onboarding-panel__header-text"]}>
          <div className={styles["board-onboarding-panel__eyebrow"]}>
            {t("eyebrow")}
          </div>
          <Title
            id={titleId}
            variant="h2"
            className={styles["board-onboarding-panel__title"]}
          >
            {t("title")}
          </Title>
          <Text
            variant="small"
            className={styles["board-onboarding-panel__description"]}
          >
            {t("description")}
          </Text>
        </div>
      </div>

      {errorMessage && <ErrorMessage message={errorMessage} />}

      <div className={styles["board-onboarding-panel__steps"]}>
        {steps.map((step, index) => (
          <Card
            key={step.id}
            variant="outlined"
            className={styles["board-onboarding-panel__step"]}
          >
            <div className={styles["board-onboarding-panel__step-header"]}>
              <span
                className={`${styles["board-onboarding-panel__step-index"]} ${
                  styles[`board-onboarding-panel__step-index--${step.status}`]
                }`}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              {step.status !== ONBOARDING_STEP_STATUS.BLOCKED && (
                <Badge
                  label={t(`status.${step.status}`)}
                  variant={STATUS_BADGE_VARIANTS[step.status]}
                  size="small"
                />
              )}
            </div>

            <div className={styles["board-onboarding-panel__step-body"]}>
              <div className={styles["board-onboarding-panel__step-title"]}>
                {step.title}
              </div>
              <Text
                variant="small"
                className={styles["board-onboarding-panel__step-description"]}
              >
                {step.description}
              </Text>
            </div>

            {step.actionLabel && (
              <div className={styles["board-onboarding-panel__step-action"]}>
                <Button
                  label={step.actionLabel}
                  aria-label={step.actionAriaLabel}
                  variant={step.status === "complete" ? "secondary" : "primary"}
                  disabled={step.actionDisabled || !step.onAction}
                  onClick={step.onAction}
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className={styles["board-onboarding-panel__footer"]}>
        {onHideGuide && (
          <Button
            label={t("hideCta")}
            aria-label={t("hideCtaAriaLabel")}
            variant="secondary"
            onClick={onHideGuide}
          />
        )}
        {onSkipOnboarding && (
          <Button
            label={t("skipCta")}
            aria-label={t("skipCtaAriaLabel")}
            variant="ghost"
            disabled={isSkipPending}
            onClick={onSkipOnboarding}
          />
        )}
      </div>
    </section>
  );
};

export default BoardOnboardingPanel;
