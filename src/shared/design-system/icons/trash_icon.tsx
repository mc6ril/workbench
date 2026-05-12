import React from "react";

type Props = {
  className?: string;
  size?: number;
};

const TrashIcon = ({ className, size = 16 }: Props) => (
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
      d="M2 4h12M6 4V2.667h4V4M3.333 4 4 13.333h8l.667-9.333M6.667 7.333v3.334M9.333 7.333v3.334"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TrashIcon;
