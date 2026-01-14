import React, { useCallback } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { isEnterKey, isSpaceKey } from "@/shared/a11y/utilities";

import styles from "./Button.module.scss";

/**
 * Button variant types.
 * - primary: Emphasizes primary actions (default)
 * - secondary: For secondary actions
 * - danger: For destructive actions
 */
type ButtonVariant = "primary" | "secondary" | "danger";

type Props = {
  /** Button label text */
  label: string;
  /** Click handler function */
  onClick: () => void;
  /** Button variant style */
  variant?: ButtonVariant;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";
  /** Custom ARIA label for accessibility (falls back to label if not provided) */
  "aria-label"?: string;
};

/**
 * Reusable Button component with variants and full accessibility support.
 * Supports keyboard navigation (Enter and Space keys) and proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <Button
 *   label="Submit"
 *   onClick={handleSubmit}
 *   variant="primary"
 *   type="submit"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Button
 *   label="Delete"
 *   onClick={handleDelete}
 *   variant="danger"
 *   aria-label="Delete item"
 * />
 * ```
 */
const Button = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  type = "button",
  "aria-label": ariaLabel,
}: Props) => {
  const buttonId = getAccessibilityId(`button-${label}`);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      if (disabled) {
        return;
      }

      if (isEnterKey(event.nativeEvent) || isSpaceKey(event.nativeEvent)) {
        event.preventDefault();
        onClick();
      }
    },
    [disabled, onClick]
  );

  const buttonClasses = [
    styles.button,
    styles[`button--${variant}`],
    fullWidth && styles["button--full-width"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      id={buttonId}
      type={type}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={buttonClasses}
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
      role="button"
    >
      {label}
    </button>
  );
};

export default Button;
