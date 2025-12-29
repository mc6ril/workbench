import React from "react";

import styles from "@/styles/components/ui/Button.module.scss";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type Props = {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
};

const Button = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  type = "button",
  "aria-label": ariaLabel,
}: Props) => {
  const buttonClasses = [
    styles.button,
    styles[`button--${variant}`],
    fullWidth && styles["button--full-width"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
