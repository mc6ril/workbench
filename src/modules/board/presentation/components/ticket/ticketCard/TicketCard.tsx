"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Button from "@/shared/design-system/button";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";

import styles from "./TicketCard.module.scss";

import type { TicketPriority } from "@/modules/board/core/domain/ticket.types";
import TicketMeta from "@/modules/board/presentation/components/ticket/ticketShared/TicketMeta";
import { buildTicketAriaLabel } from "@/modules/board/utils/ticketUtils";

export type TicketCardProps = {
  id: string;
  title: string;
  ticketCode?: string | null;
  status?: string;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  priority?: TicketPriority | null;
  storyPoints?: number | null;
  onEdit?: (id: string) => void;
  onPrefetch?: (id: string) => void;
};

type Props = TicketCardProps;

const HOVER_PREFETCH_DELAY_MS = 120;

const TicketCard = ({
  id,
  title,
  ticketCode,
  assigneeName,
  assigneeAvatarUrl,
  priority,
  storyPoints,
  onEdit,
  onPrefetch,
}: Props) => {
  const t = useTranslations("pages.board.ticketCard");
  const hoverPrefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const baseId = useMemo(() => getAccessibilityId(`board-ticket-${id}`), [id]);

  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  const handleEdit = useCallback((): void => {
    if (onEdit) {
      onEdit(id);
    }
  }, [onEdit, id]);

  const clearHoverPrefetch = useCallback((): void => {
    if (hoverPrefetchTimeoutRef.current !== null) {
      clearTimeout(hoverPrefetchTimeoutRef.current);
      hoverPrefetchTimeoutRef.current = null;
    }
  }, []);

  const handlePrefetch = useCallback((): void => {
    if (onPrefetch) {
      onPrefetch(id);
    }
  }, [id, onPrefetch]);

  const handleMouseEnter = useCallback((): void => {
    if (!onPrefetch) {
      return;
    }

    clearHoverPrefetch();
    hoverPrefetchTimeoutRef.current = setTimeout(() => {
      hoverPrefetchTimeoutRef.current = null;
      handlePrefetch();
    }, HOVER_PREFETCH_DELAY_MS);
  }, [clearHoverPrefetch, handlePrefetch, onPrefetch]);

  const handleFocusCapture = useCallback((): void => {
    clearHoverPrefetch();
    handlePrefetch();
  }, [clearHoverPrefetch, handlePrefetch]);

  const handlePointerDown = useCallback((): void => {
    clearHoverPrefetch();
    handlePrefetch();
  }, [clearHoverPrefetch, handlePrefetch]);

  useEffect(() => {
    return () => {
      clearHoverPrefetch();
    };
  }, [clearHoverPrefetch]);

  const cardAriaLabel = useMemo(() => {
    return buildTicketAriaLabel({
      ticketAriaLabel: t("ticketAriaLabel"),
      title,
      ticketCode,
      assigneeName,
      assigneeLabel: t("assigneeLabel"),
      priority: priority ? t(`priority.${priority}`) : undefined,
      priorityLabel: t("priorityLabel"),
      storyPointsLabel:
        typeof storyPoints === "number"
          ? t("storyPointsLabel", {
              count: storyPoints,
            })
          : undefined,
    });
  }, [t, title, ticketCode, assigneeName, priority, storyPoints]);

  const cardClasses = useMemo(() => {
    return [
      styles["ticket-card__row"],
      priority ? styles[`ticket-card__row--priority-${priority}`] : null,
    ]
      .filter(Boolean)
      .join(" ");
  }, [priority]);

  return (
    <article
      className={cardClasses}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-label={cardAriaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={clearHoverPrefetch}
      onFocusCapture={handleFocusCapture}
      onPointerDown={handlePointerDown}
    >
      <div className={styles["ticket-card__main"]}>
        <TicketMeta
          className={styles["ticket-card__meta"]}
          assigneeClassName={styles["ticket-card__assignee"]}
          ticketCodeClassName={styles["ticket-card__id"]}
          ticketCode={ticketCode}
          assigneeName={assigneeName}
          assigneeAvatarUrl={assigneeAvatarUrl}
          assigneeLabel={t("assigneeLabel")}
        />
        <Title
          id={titleId}
          variant="h3"
          className={styles["ticket-card__title"]}
        >
          {title}
        </Title>
      </div>
      <div className={styles["ticket-card__actions"]}>
        {onEdit && (
          <Button
            label={t("openTicketLabel")}
            onClick={handleEdit}
            variant="edit"
          />
        )}
      </div>
    </article>
  );
};

export default React.memo(TicketCard);
