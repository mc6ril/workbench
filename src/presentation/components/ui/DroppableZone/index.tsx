"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./DroppableZone.module.scss";

type Props = {
  /** Droppable zone content */
  children: React.ReactNode;
  /** Unique identifier for the droppable zone */
  id: string;
  /** Drop handler */
  onDrop?: () => void;
  /** Types of items this zone accepts (optional filtering) */
  accepts?: string[];
  /** Whether the zone is disabled */
  disabled?: boolean;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
};

/**
 * Reusable DroppableZone component for creating drop targets in drag-and-drop scenarios.
 * Uses @dnd-kit for drop functionality with visual feedback.
 * Includes full accessibility support with proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <DndContext onDragEnd={handleDragEnd}>
 *   <DroppableZone id="zone-1" ariaLabel="Drop zone 1">
 *     <Stack>
 *       {items.map((item) => (
 *         <DraggableItem key={item.id} id={item.id}>
 *           {item.content}
 *         </DraggableItem>
 *       ))}
 *     </Stack>
 *   </DroppableZone>
 * </DndContext>
 * ```
 */
const DroppableZone = ({
  children,
  id,
  onDrop,
  accepts,
  disabled = false,
  ariaLabel,
}: Props) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
    data: {
      accepts,
    },
  });

  React.useEffect(() => {
    if (isOver && onDrop) {
      // Note: onDrop should be handled in DndContext's onDragEnd handler
      // This is just for visual feedback
    }
  }, [isOver, onDrop]);

  const droppableId = getAccessibilityId(`droppable-${id}`);

  return (
    <div
      ref={setNodeRef}
      id={droppableId}
      className={`${styles["droppable-zone"]} ${
        isOver ? styles["droppable-zone--over"] : ""
      } ${disabled ? styles["droppable-zone--disabled"] : ""}`}
      role="region"
      aria-label={ariaLabel || `Drop zone ${id}`}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </div>
  );
};

export default React.memo(DroppableZone);
