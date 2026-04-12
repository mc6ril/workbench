"use client";

import type { CSSProperties } from "react";

import styles from "./styles.module.scss";

import { useRecipesQuickListFeedbackStore } from "@/modules/recipes/presentation/stores/useRecipesQuickListFeedbackStore";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const RecipesQuickListFeedbackLayer = () => {
  const animations = useRecipesQuickListFeedbackStore((state) => state.animations);

  if (animations.length === 0) {
    return null;
  }

  return (
    <div
      className={styles["recipes-page__quick-list-feedback-layer"]}
      aria-hidden="true"
    >
      {animations.map((animation) => {
        const deltaX = animation.endX - animation.startX;
        const deltaY = animation.endY - animation.startY;
        const distance = Math.hypot(deltaX, deltaY);
        const streakLength = clamp(distance * 0.34, 64, 148);
        const startLeft = animation.startX - streakLength * 0.14;
        const startTop = animation.startY - 1;
        const endLeft = animation.endX - streakLength * 0.9;
        const translateX = endLeft - startLeft;
        const translateY = animation.endY - startTop;
        const angle = Math.atan2(deltaY, deltaX);

        const style = {
          left: `${startLeft}px`,
          top: `${startTop}px`,
          width: `${streakLength}px`,
          "--recipes-quick-list-feedback-translate-x": `${translateX}px`,
          "--recipes-quick-list-feedback-translate-y": `${translateY}px`,
          "--recipes-quick-list-feedback-angle": `${angle}rad`,
        } as CSSProperties;

        return (
          <span
            key={animation.id}
            className={styles["recipes-page__quick-list-feedback-streak"]}
            style={style}
          />
        );
      })}
    </div>
  );
};

export default RecipesQuickListFeedbackLayer;
