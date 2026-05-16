import React from "react";

type Props = {
  className?: string;
  size?: number;
};

const MealsIcon = ({ className, size = 16 }: Props) => (
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
      d="M8 3a4 4 0 1 0 0 8A4 4 0 0 0 8 3z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M8 5v3l1.5 1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 13h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default MealsIcon;
