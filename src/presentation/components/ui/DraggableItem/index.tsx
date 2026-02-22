"use client";

import React, { useRef } from "react";
import { useDraggable } from "@dnd-kit/core";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./DraggableItem.module.scss";

const DRAG_ACTIVATION_DELAY_MS = 1000;

type Props = {
  /** Draggable item content */
  children: React.ReactNode;
  /** Unique identifier for the draggable item */
  id: string;
  /** Index of the item (for sorting) */
  index?: number;
  /** Drag start handler */
  onDragStart?: () => void;
  /** Drag end handler */
  onDragEnd?: () => void;
  /** Called on short press (when drag did not start). Ignored when target is a button. */
  onClick?: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
};

/**
 * Reusable DraggableItem component wrapper for enabling drag-and-drop functionality.
 * Uses @dnd-kit for drag-and-drop with keyboard support.
 * Short press triggers onClick; long press (≥ delay) activates drag.
 *
 * @example
 * ```tsx
 * <DndContext>
 *   <DraggableItem id="item-1" ariaLabel="Draggable item 1">
 *     <Card>Item Content</Card>
 *   </DraggableItem>
 * </DndContext>
 * ```
 */
const DraggableItem = ({
  children,
  id,
  index,
  onDragStart,
  onDragEnd,
  onClick,
  disabled = false,
  ariaLabel,
}: Props) => {
  const t = useTranslation("ui.draggableItem");
  const pointerDownAtRef = useRef<number | null>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled,
      data: {
        index,
      },
    });

  React.useEffect(() => {
    if (isDragging && onDragStart) {
      onDragStart();
    }
  }, [isDragging, onDragStart]);

  React.useEffect(() => {
    if (!isDragging && onDragEnd) {
      onDragEnd();
    }
  }, [isDragging, onDragEnd]);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const draggableId = getAccessibilityId(`draggable-${id}`);
  const isGrabbed = isDragging;

  // Safely get listeners with fallback to empty object when disabled
  const safeListeners = (listeners ?? {}) as {
    onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
    [k: string]: unknown;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    pointerDownAtRef.current = Date.now();
    const dndPointerDown = safeListeners.onPointerDown;
    if (dndPointerDown) {
      dndPointerDown(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    const downAt = pointerDownAtRef.current;
    pointerDownAtRef.current = null;
    const duration = downAt != null ? Date.now() - downAt : 0;
    const wasShortPress = duration < DRAG_ACTIVATION_DELAY_MS;

    if (wasShortPress && !isDragging) {
      if (onClick && !(e.target instanceof HTMLElement && e.target.closest("button"))) {
        onClick();
      }
      return;
    }

    const dndPointerUp = safeListeners.onPointerUp;
    if (dndPointerUp) {
      dndPointerUp(e);
    }
  };

  const { onPointerDown: _skip, onPointerUp: _skipUp, ...restListeners } =
    safeListeners;

  return (
    <div
      ref={setNodeRef}
      id={draggableId}
      className={`${styles["draggable-item"]} ${
        isDragging ? styles["draggable-item--dragging"] : ""
      } ${disabled ? styles["draggable-item--disabled"] : ""}`}
      style={style}
      {...restListeners}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      role={attributes.role || "button"}
      tabIndex={
        attributes.tabIndex !== undefined
          ? attributes.tabIndex
          : disabled
            ? -1
            : 0
      }
      aria-label={ariaLabel || t("ariaLabel", { id })}
      aria-grabbed={isGrabbed}
      aria-disabled={
        attributes["aria-disabled"] !== undefined
          ? attributes["aria-disabled"]
          : disabled
      }
    >
      {children}
    </div>
  );
};

export default React.memo(DraggableItem);
