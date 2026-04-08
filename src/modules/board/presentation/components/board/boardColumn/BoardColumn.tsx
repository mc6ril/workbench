"use client";

import React, { useMemo } from "react";
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
import { useTranslation } from "@/shared/i18n";

import styles from "./BoardColumn.module.scss";

import { BOARD_COLUMN_DROP_PREFIX } from "@/modules/board/constants/board";
import type { BoardColumnProps } from "@/modules/board/presentation/components/board/boardColumn/BoardColumn.types";
import TicketCard from "@/modules/board/presentation/components/ticket/ticketCard/TicketCard";
import type { BoardTicketViewModel } from "@/modules/board/presentation/types/boardView.types";

const SORTABLE_TRANSITION = Object.freeze({
  duration: 160,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
});
const LONG_COLUMN_THRESHOLD = 40;

const getColumnClassName = (className?: string): string => {
  return [styles["board-column"], className].filter(Boolean).join(" ");
};

type SortableTicketItemProps = {
  ticket: BoardTicketViewModel;
  isSortable: boolean;
  onTicketClick?: (ticketId: string) => void;
};

const SortableTicketItemComponent = ({
  ticket,
  isSortable,
  onTicketClick,
}: SortableTicketItemProps) => {
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
  const sortableProps = isSortable ? { ...attributes, ...listeners } : {};

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={styles["board-column__list-item"]}
      data-dragging={isDragging}
    >
      <div {...sortableProps} className={styles["board-column__sortable-card"]}>
        <TicketCard {...ticket} onEdit={onTicketClick} />
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
  className,
}: BoardColumnProps) => {
  const t = useTranslation("pages.board.column");
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
