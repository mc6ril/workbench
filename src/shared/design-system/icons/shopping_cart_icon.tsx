import React from "react";

type Props = {
  className?: string;
  size?: number;
};

const ShoppingCartIcon = ({ className, size = 16 }: Props) => (
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
      d="M1 1h2l1.5 7.5h7l1.5-5.5H4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6.5" cy="13" r="1" fill="currentColor" />
    <circle cx="11.5" cy="13" r="1" fill="currentColor" />
  </svg>
);

export default ShoppingCartIcon;
