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

import TicketCard, {
  TicketCardProps,
} from "@/presentation/components/ticketCard/TicketCard";
import Title from "@/presentation/components/ui/Title";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./BoardColumn.module.scss";

export type BoardColumnProps = {
  id: string;
  title: string;
  tickets: TicketCardProps[];
  isDragging?: boolean;
  onTicketClick?: (ticketId: string) => void;
  className?: string;
};

type SortableTicketItemProps = {
  ticket: TicketCardProps;
  onTicketClick?: (ticketId: string) => void;
};

const SortableTicketItem = ({ ticket, onTicketClick }: SortableTicketItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
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

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={styles["board-column__list-item"]}
      data-dragging={isDragging}
    >
      <div
        {...attributes}
        {...listeners}
        className={styles["board-column__sortable-card"]}
      >
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
  onTicketClick,
  className,
}: BoardColumnProps) => {
  const t = useTranslation("pages.board.column");
  const droppableId = `column:${id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
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
                onTicketClick={onTicketClick}
              />
            );
          })}
        </SortableContext>
        {tickets.length === 0 && <li className={styles["board-column__list-item"]} />}
      </ul>
    </section>
  );
};

export default React.memo(BoardColumn);
