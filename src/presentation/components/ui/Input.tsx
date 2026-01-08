import type { InputHTMLAttributes } from "react";
import React, { forwardRef } from "react";

import styles from "@/styles/components/ui/Input.module.scss";

import { getAccessibilityId } from "@/shared/a11y";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
};

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      error,
      required = false,
      id,
      "aria-describedby": ariaDescribedBy,
      ...inputProps
    },
    ref
  ) => {
    const baseKey = `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const inputId = id || getAccessibilityId(baseKey);
    const errorId = error ? getAccessibilityId(`${baseKey}-error`) : undefined;
    const describedBy =
      [ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined;

    const labelClasses = [
      styles["input-label"],
      required && styles["input-label--required"],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles["input-wrapper"]}>
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          aria-required={required}
          {...inputProps}
        />
        {error && (
          <div
            id={errorId}
            className={styles["input-error"]}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
