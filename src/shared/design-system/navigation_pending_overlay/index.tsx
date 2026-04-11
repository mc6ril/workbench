"use client";

import React from "react";

import Loader from "@/shared/design-system/loader";
import { useNavigationFeedbackStore } from "@/shared/stores/useNavigationFeedbackStore";

import styles from "./navigation_pending_overlay.module.scss";

/**
 * Lightweight global overlay shown while a client navigation is in progress.
 * Visibility is driven by {@link useNavigationFeedbackStore} (status === "visible").
 */
const NavigationPendingOverlay = () => {
  const status = useNavigationFeedbackStore((s) => s.status);

  if (status !== "visible") {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.overlay__inner} aria-hidden="true">
        <Loader variant="inline" size="medium" />
      </div>
    </div>
  );
};

export default React.memo(NavigationPendingOverlay);
