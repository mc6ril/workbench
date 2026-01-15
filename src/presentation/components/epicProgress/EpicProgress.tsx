"use client";

import React from "react";

import { Text } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { ARIA_ROLES } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./EpicProgress.module.scss";

type Props = {
  /** Progress percentage (0-100) */
  progress: number;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
  /** Optional unique identifier for generating unique accessibility IDs */
  id?: string;
};

/**
 * EpicProgress component displays epic completion percentage with visual progress bar.
 * Includes full accessibility support with proper ARIA progressbar attributes.
 */
const EpicProgress = ({ progress, ariaLabel, className, id }: Props) => {
  const t = useTranslation("pages.epics.epicProgress");

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const baseKey = id ? `epic-progress-${id}` : "epic-progress";
  const progressId = getAccessibilityId(baseKey);
  const progressLabelId = getAccessibilityId(`${baseKey}-label`);

  const displayAriaLabel = ariaLabel || t("ariaLabel");
  const progressText = t("progressLabel", { progress: clampedProgress });

  const progressClasses = [styles["epic-progress"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={progressClasses}>
      <div
        id={progressId}
        role={ARIA_ROLES.PROGRESSBAR}
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={displayAriaLabel}
        aria-describedby={progressLabelId}
        className={styles["epic-progress__bar"]}
      >
        <div
          className={styles["epic-progress__fill"]}
          style={{ width: `${clampedProgress}%` }}
          aria-hidden="true"
        />
      </div>
      <Text
        id={progressLabelId}
        as="span"
        variant="caption"
        className={styles["epic-progress__label"]}
      >
        {progressText}
      </Text>
    </div>
  );
};

export default React.memo(EpicProgress);
