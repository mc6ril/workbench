"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  defaultAnimateLayoutChanges,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";

import styles from "./BoardColumn.module.scss";

import {
  BOARD_COLUMN_DROP_PREFIX,
  BOARD_MOUSE_DRAG_ACTIVATION_DISTANCE_PX,
  BOARD_TOUCH_DRAG_ACTIVATION_DELAY_MS,
  BOARD_TOUCH_DRAG_ACTIVATION_TOLERANCE_PX,
} from "@/modules/board/constants/board";
import type { BoardColumnProps } from "@/modules/board/presentation/components/board/boardColumn/BoardColumn.types";
import TicketCard from "@/modules/board/presentation/components/ticket/ticketCard/TicketCard";
import type { BoardTicketViewModel } from "@/modules/board/presentation/types/boardView.types";

const SORTABLE_TRANSITION = Object.freeze({
  duration: 160,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
});
const LONG_COLUMN_THRESHOLD = 40;
const HOVER_PREFETCH_DELAY_MS = 120;

const getColumnClassName = (className?: string): string => {
  return [styles["board-column"], className].filter(Boolean).join(" ");
};

type SortableTicketItemProps = {
  ticket: BoardTicketViewModel;
  isSortable: boolean;
  onTicketClick?: (ticketId: string) => void;
  onTicketPrefetch?: (ticketId: string) => void;
};

const SortableTicketItemComponent = ({
  ticket,
  isSortable,
  onTicketClick,
  onTicketPrefetch,
}: SortableTicketItemProps) => {
  const hoverPrefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const touchDragIntentTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const mouseOriginRef = useRef<{
    x: number;
    y: number;
  } | null>(null);
  const touchOriginRef = useRef<{
    x: number;
    y: number;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    disabled: !isSortable,
    animateLayoutChanges: defaultAnimateLayoutChanges,
    transition: SORTABLE_TRANSITION,
  });

  const style = useMemo<React.CSSProperties>(() => {
    return {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  }, [transform, transition]);
  const clearHoverPrefetch = useCallback((): void => {
    if (hoverPrefetchTimeoutRef.current !== null) {
      clearTimeout(hoverPrefetchTimeoutRef.current);
      hoverPrefetchTimeoutRef.current = null;
    }
  }, []);

  const clearTouchDragIntent = useCallback((): void => {
    if (touchDragIntentTimeoutRef.current !== null) {
      clearTimeout(touchDragIntentTimeoutRef.current);
      touchDragIntentTimeoutRef.current = null;
    }
  }, []);

  const handlePrefetch = useCallback((): void => {
    if (onTicketPrefetch) {
      onTicketPrefetch(ticket.id);
    }
  }, [onTicketPrefetch, ticket.id]);

  const handleOpenTicket = useCallback((): void => {
    if (onTicketClick) {
      onTicketClick(ticket.id);
    }
  }, [onTicketClick, ticket.id]);

  const handleMouseEnter = useCallback((): void => {
    if (!onTicketPrefetch) {
      return;
    }

    clearHoverPrefetch();
    hoverPrefetchTimeoutRef.current = setTimeout(() => {
      hoverPrefetchTimeoutRef.current = null;
      handlePrefetch();
    }, HOVER_PREFETCH_DELAY_MS);
  }, [clearHoverPrefetch, handlePrefetch, onTicketPrefetch]);

  const handleFocus = useCallback((): void => {
    clearHoverPrefetch();
    handlePrefetch();
  }, [clearHoverPrefetch, handlePrefetch]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (event.button !== 0) {
        return;
      }

      clearHoverPrefetch();
      handlePrefetch();
      suppressClickRef.current = false;
      mouseOriginRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    },
    [clearHoverPrefetch, handlePrefetch]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (!isSortable || !mouseOriginRef.current) {
        return;
      }

      const distance = Math.hypot(
        event.clientX - mouseOriginRef.current.x,
        event.clientY - mouseOriginRef.current.y
      );

      if (distance >= BOARD_MOUSE_DRAG_ACTIVATION_DISTANCE_PX) {
        suppressClickRef.current = true;
      }
    },
    [isSortable]
  );

  const handleMouseUp = useCallback((): void => {
    mouseOriginRef.current = null;
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>): void => {
      clearHoverPrefetch();
      handlePrefetch();
      suppressClickRef.current = false;

      const touch = event.touches[0];
      if (touch) {
        touchOriginRef.current = {
          x: touch.clientX,
          y: touch.clientY,
        };
      }

      clearTouchDragIntent();
      if (!isSortable) {
        return;
      }

      touchDragIntentTimeoutRef.current = setTimeout(() => {
        suppressClickRef.current = true;
        touchDragIntentTimeoutRef.current = null;
      }, BOARD_TOUCH_DRAG_ACTIVATION_DELAY_MS);
    },
    [clearHoverPrefetch, clearTouchDragIntent, handlePrefetch, isSortable]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>): void => {
      const touchOrigin = touchOriginRef.current;
      const touch = event.touches[0];
      if (!touchOrigin || !touch || !isSortable) {
        return;
      }

      const distance = Math.hypot(
        touch.clientX - touchOrigin.x,
        touch.clientY - touchOrigin.y
      );

      if (distance >= BOARD_TOUCH_DRAG_ACTIVATION_TOLERANCE_PX) {
        suppressClickRef.current = true;
        clearTouchDragIntent();
      }
    },
    [clearTouchDragIntent, isSortable]
  );

  const handleTouchEnd = useCallback((): void => {
    touchOriginRef.current = null;
    clearTouchDragIntent();
  }, [clearTouchDragIntent]);

  const handleClick = useCallback((): void => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    handleOpenTicket();
  }, [handleOpenTicket]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      handleOpenTicket();
    },
    [handleOpenTicket]
  );

  useEffect(() => {
    return () => {
      clearHoverPrefetch();
      clearTouchDragIntent();
    };
  }, [clearHoverPrefetch, clearTouchDragIntent]);
  const role = attributes.role ?? "button";
  const tabIndex = attributes.tabIndex ?? 0;
  const handleSortableMouseDown = listeners?.onMouseDown;
  const handleSortableTouchStart = listeners?.onTouchStart;
  const handleSortableKeyDown = listeners?.onKeyDown;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={styles["board-column__list-item"]}
      data-dragging={isDragging}
    >
      <div
        className={styles["board-column__sortable-card"]}
        data-sortable={isSortable}
        role={isSortable || onTicketClick ? role : undefined}
        tabIndex={isSortable || onTicketClick ? tabIndex : undefined}
        aria-disabled={attributes["aria-disabled"]}
        aria-pressed={attributes["aria-pressed"]}
        aria-roledescription={attributes["aria-roledescription"]}
        aria-describedby={attributes["aria-describedby"]}
        onClick={onTicketClick ? handleClick : undefined}
        onFocus={handleFocus}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onTicketClick) {
            handleKeyDown(event);
            return;
          }

          handleSortableKeyDown?.(event);
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={clearHoverPrefetch}
        onMouseDown={(event) => {
          handleSortableMouseDown?.(event);
          handleMouseDown(event);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchCancel={handleTouchEnd}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={(event) => {
          handleSortableTouchStart?.(event);
          handleTouchStart(event);
        }}
      >
        <TicketCard {...ticket} />
      </div>
    </li>
  );
};
const SortableTicketItem = React.memo(SortableTicketItemComponent);

SortableTicketItem.displayName = "SortableTicketItem";

const BoardColumn = ({
  id,
  title,
  tickets,
  isDragging,
  isSortable = true,
  onTicketClick,
  onTicketPrefetch,
  className,
}: BoardColumnProps) => {
  const t = useTranslations("pages.board.column");
  const droppableId = `${BOARD_COLUMN_DROP_PREFIX}${id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    disabled: !isSortable,
  });

  const { sectionId, headerId, listId } = useMemo(() => {
    const baseId = getAccessibilityId(`board-column-${id}`);
    return {
      sectionId: baseId,
      headerId: `${baseId}-header`,
      listId: `${baseId}-list`,
    };
  }, [id]);

  const ticketIds = useMemo(() => {
    return tickets.map((ticket) => ticket.id);
  }, [tickets]);
  const isLongColumn = tickets.length >= LONG_COLUMN_THRESHOLD;
  const columnClasses = useMemo(
    () => getColumnClassName(className),
    [className]
  );

  return (
    <section
      id={sectionId}
      className={columnClasses}
      aria-labelledby={headerId}
      aria-label={t("ariaLabel", { title })}
    >
      <header className={styles["board-column__header"]}>
        <Title
          id={headerId}
          variant="h2"
          className={styles["board-column__title"]}
        >
          {title}
        </Title>
      </header>
      <ul
        ref={setNodeRef}
        id={listId}
        className={styles["board-column__list"]}
        role="list"
        aria-labelledby={headerId}
        data-over={isOver}
        data-dragging={isDragging}
        data-long-list={isLongColumn}
      >
        <SortableContext
          items={ticketIds}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => {
            return (
              <SortableTicketItem
                key={ticket.id}
                ticket={ticket}
                isSortable={isSortable}
                onTicketClick={onTicketClick}
                onTicketPrefetch={onTicketPrefetch}
              />
            );
          })}
        </SortableContext>
        {ticketIds.length === 0 && (
          <li className={styles["board-column__list-item"]} />
        )}
      </ul>
    </section>
  );
};

export default React.memo(BoardColumn);
