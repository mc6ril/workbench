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

import type { BoardColumnProps } from "@/presentation/components/board/boardColumn/BoardColumn.types";
import TicketCard from "@/presentation/components/ticket/ticketCard/TicketCard";
import Title from "@/presentation/components/ui/Title";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { BOARD_COLUMN_DROP_PREFIX } from "@/shared/constants/board";
import { useTranslation } from "@/shared/i18n";
import type { BoardTicketViewModel } from "@/shared/types/board";

import styles from "./BoardColumn.module.scss";

type SortableTicketItemProps = {
  ticket: BoardTicketViewModel;
  isSortable: boolean;
  onTicketClick?: (ticketId: string) => void;
};

const SortableTicketItem = ({
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
    animateLayoutChanges: (args) => defaultAnimateLayoutChanges(args),
    transition: {
      duration: 160,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
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

  const baseId = useMemo(() => getAccessibilityId(`board-column-${id}`), [id]);

  const sectionId = baseId;
  const headerId = `${baseId}-header`;
  const listId = `${baseId}-list`;

  const columnClasses = [styles["board-column"], className]
    .filter(Boolean)
    .join(" ");

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
      >
        <SortableContext
          items={tickets.map((ticket) => ticket.id)}
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
        {tickets.length === 0 && (
          <li className={styles["board-column__list-item"]} />
        )}
      </ul>
    </section>
  );
};

export default React.memo(BoardColumn);
