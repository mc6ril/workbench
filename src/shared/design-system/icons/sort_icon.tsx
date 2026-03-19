import React from "react";

type Props = {
  /** Additional CSS class name */
  className?: string;
  /** Icon size in pixels */
  size?: number;
};

/**
 * Sort icon SVG component (horizontal lines for sort order).
 * Used for sort actions in navbar and sort controls.
 */
const SortIcon = ({ className, size = 16 }: Props) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M2 4h12M4 8h8M6 12h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default SortIcon;
