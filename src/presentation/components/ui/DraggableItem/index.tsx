"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./DraggableItem.module.scss";

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
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
};

/**
 * Reusable DraggableItem component wrapper for enabling drag-and-drop functionality.
 * Uses @dnd-kit for drag-and-drop with keyboard support.
 * Includes full accessibility support with proper ARIA attributes.
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
  disabled = false,
  ariaLabel,
}: Props) => {
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

  return (
    <div
      ref={setNodeRef}
      id={draggableId}
      className={`${styles["draggable-item"]} ${
        isDragging ? styles["draggable-item--dragging"] : ""
      } ${disabled ? styles["draggable-item--disabled"] : ""}`}
      style={style}
      {...listeners}
      {...attributes}
      role={attributes.role || "button"}
      tabIndex={
        attributes.tabIndex !== undefined
          ? attributes.tabIndex
          : disabled
            ? -1
            : 0
      }
      aria-label={ariaLabel || `Draggable item ${id}`}
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
