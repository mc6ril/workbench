"use client";

import React, { useMemo } from "react";

import TicketCard, {
  TicketCardProps,
} from "@/presentation/components/ticketCard/TicketCard";
import {
  DraggableItem,
  DroppableZone,
  Text,
  Title,
} from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./BoardColumn.module.scss";

export type BoardColumnProps = {
  id: string;
  title: string;
  tickets: TicketCardProps[];
  onItemOpen?: (id: string) => void;
  onItemEdit?: (id: string) => void;
  className?: string;
};

const BoardColumn = ({
  id,
  title,
  tickets,
  onItemOpen,
  onItemEdit,
  className,
}: BoardColumnProps) => {
  const t = useTranslation("pages.board.column");

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
        id={listId}
        className={styles["board-column__list"]}
        role="list"
        aria-labelledby={headerId}
      >
        {tickets.map((ticket) => {
          const draggableId = `drag:${id}:${ticket.id}`;
          const droppableId = `drop:${id}:${ticket.id}`;

          return (
            <li key={ticket.id} className={styles["board-column__list-item"]}>
              <DroppableZone
                id={droppableId}
                ariaLabel={t("dropZoneAriaLabel", { title })}
              >
                <DraggableItem id={draggableId}>
                  <TicketCard
                    {...ticket}
                    onOpen={onItemOpen}
                    onEdit={onItemEdit}
                  />
                </DraggableItem>
              </DroppableZone>
            </li>
          );
        })}
        {tickets.length === 0 && (
          <li className={styles["board-column__list-item"]}>
            <DroppableZone
              id={`drop:${id}:_empty`}
              ariaLabel={t("emptyDropZoneAriaLabel", { title })}
            >
              <div className={styles["board-column__empty"]}>
                <Text as="p" variant="caption">
                  {t("emptyColumnPlaceholder")}
                </Text>
              </div>
            </DroppableZone>
          </li>
        )}
      </ul>
    </section>
  );
};

export default BoardColumn;
