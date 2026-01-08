"use client";

import React from "react";

import styles from "@/styles/components/ui/ErrorMessage.module.scss";

import { getAccessibilityId } from "@/shared/a11y";
import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import Button from "./Button";

type Props = {
  error: { code?: string } | null | undefined;
  onRetry?: () => void;
  className?: string;
  "aria-label"?: string;
};

const ErrorMessage = ({
  error,
  onRetry,
  className,
  "aria-label": ariaLabel,
}: Props) => {
  const tErrors = useTranslation("errors");

  if (!error) {
    return null;
  }

  const errorMessage = getErrorMessage(error, tErrors);
  const errorId = getAccessibilityId("error-message");

  const errorClasses = [styles["error-message"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={errorClasses}
      role="alert"
      aria-live="assertive"
      aria-label={ariaLabel || errorMessage}
      id={errorId}
    >
      <div className={styles["error-message__content"]}>
        <p className={styles["error-message__text"]}>{errorMessage}</p>
        {onRetry && (
          <Button
            label={tErrors("retry")}
            onClick={onRetry}
            variant="outline"
            type="button"
            aria-label={tErrors("retryAriaLabel")}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ErrorMessage);
