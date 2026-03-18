import React, { useMemo } from "react";
import Image from "next/image";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { getInitials } from "@/shared/utils";

import styles from "./Avatar.module.scss";

type AvatarSize = "sm" | "md" | "lg" | "xl";

/** Pixel dimensions for each avatar size variant (must match SCSS variables). */
const AVATAR_SIZE_PX: Record<AvatarSize, number> = {
  sm: 28,
  md: 32,
  lg: 48,
  xl: 64,
};

type Props = {
  /** URL of the avatar image */
  src?: string | null;
  /** User display name (used for initials fallback and alt text) */
  name?: string | null;
  /** Avatar size variant */
  size?: AvatarSize;
  /** Custom ARIA label */
  "aria-label"?: string;
};

/**
 * Reusable Avatar component with image and initials fallback.
 * Displays a user avatar image, or shows initials when no image is available.
 * Supports multiple sizes and proper accessibility attributes.
 */
const Avatar = ({ src, name, size = "md", "aria-label": ariaLabel }: Props) => {
  const initials = useMemo(() => getInitials(name), [name]);
  const avatarId = getAccessibilityId(`avatar-${name ?? "unknown"}`);
  const displayLabel = ariaLabel ?? name ?? "User avatar";
  const sizePx = AVATAR_SIZE_PX[size];

  const containerClasses = [styles.avatar, styles[`avatar--${size}`]]
    .filter(Boolean)
    .join(" ");

  if (src) {
    return (
      <div
        id={avatarId}
        className={containerClasses}
        role="img"
        aria-label={displayLabel}
      >
        <Image
          src={src}
          alt={displayLabel}
          width={sizePx}
          height={sizePx}
          className={styles.avatar__image}
        />
      </div>
    );
  }

  return (
    <div
      id={avatarId}
      className={containerClasses}
      role="img"
      aria-label={displayLabel}
    >
      <span className={styles.avatar__initials} aria-hidden="true">
        {initials}
      </span>
    </div>
  );
};

export default React.memo(Avatar);
