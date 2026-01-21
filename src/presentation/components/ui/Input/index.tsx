import type { InputHTMLAttributes } from "react";
import React, { forwardRef } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./Input.module.scss";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  /** Input label text */
  label?: string;
  /** Error message to display below input */
  error?: string;
  /** Helper text to display below input (shown when no error) */
  helperText?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Custom ARIA label for accessibility (falls back to label if not provided) */
  "aria-label"?: string;
  /** Custom placeholder for the input */
  placeholder?: string;
  /** Is input inline with the label */
  inline?: boolean;
};

/**
 * Reusable Input component with label, error state, and helper text support.
 * Includes full accessibility support with proper form labeling, error association, and ARIA attributes.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   name="email"
 *   type="email"
 *   required
 *   error={errors.email?.message}
 *   helperText="Enter your email address"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Input
 *   label="Password"
 *   name="password"
 *   type="password"
 *   required
 *   aria-label="Enter your password"
 * />
 * ```
 */
const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      placeholder,
      id,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      inline = false,
      ...inputProps
    },
    ref
  ) => {
    const baseKey = `input-${label}`;
    const inputId = id || getAccessibilityId(baseKey);
    const errorId = error ? getAccessibilityId(`${baseKey}-error`) : undefined;
    const helperTextId = helperText && !error
      ? getAccessibilityId(`${baseKey}-helper`)
      : undefined;
    const describedBy =
      [ariaDescribedBy, errorId, helperTextId].filter(Boolean).join(" ") ||
      undefined;

    const labelClasses = [
      styles["input-label"],
      required && styles["input-label--required"],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles["input-wrapper"]} style={{ flexDirection: inline ? "row" : "column" }}>
        {label && (
          <label htmlFor={inputId} className={labelClasses} >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          aria-label={ariaLabel || label}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          aria-required={required}
          aria-disabled={disabled}
          placeholder={placeholder}
          disabled={disabled}
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
        {!error && helperText && (
          <div id={helperTextId} className={styles["input-helper"]}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
