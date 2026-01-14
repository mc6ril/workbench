"use client";

import React, { useMemo } from "react";

import TicketListItem, {
  TicketListItemProps,
} from "@/presentation/components/ticketListItem/TicketListItem";
import {
  EmptyState,
  ErrorMessage,
  Loader,
  Text,
  Title,
} from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./TicketList.module.scss";

export type TicketListItemViewModel = TicketListItemProps;

type Props = {
  tickets: TicketListItemViewModel[];
  isLoading?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  onItemOpen?: (id: string) => void;
  onItemEdit?: (id: string) => void;
  onItemToggleSelect?: (id: string) => void;
  className?: string;
};

const TicketList = ({
  tickets,
  isLoading = false,
  isEmpty,
  errorMessage,
  onItemOpen,
  onItemEdit,
  onItemToggleSelect,
  className,
}: Props) => {
  const t = useTranslation("pages.backlog.ticketList");

  const listId = useMemo(() => getAccessibilityId("backlog-ticket-list"), []);

  const listClasses = [styles["ticket-list"], className]
    .filter(Boolean)
    .join(" ");

  const effectiveIsEmpty = isEmpty ?? (!isLoading && tickets.length === 0);

  if (isLoading) {
    return (
      <div className={listClasses}>
        <Loader ariaLabel={t("ariaLabel")} />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className={listClasses}>
        <ErrorMessage message={errorMessage} title={t("errorTitle")} />
      </div>
    );
  }

  if (effectiveIsEmpty) {
    return (
      <div className={listClasses}>
        <EmptyState
          title={t("emptyTitle")}
          message={t("emptyMessage")}
          ariaLabel={t("ariaLabel")}
        />
      </div>
    );
  }

  return (
    <section className={listClasses} aria-labelledby={listId}>
      <div className={styles["ticket-list__header"]}>
        <Title
          id={listId}
          variant="h2"
          className={styles["ticket-list__title"]}
        >
          {t("ariaLabel")}
        </Title>
        <Text as="p" variant="caption" className={styles["ticket-list__meta"]}>
          {t("count", { count: tickets.length })}
        </Text>
      </div>
      <ul className={styles["ticket-list__items"]} aria-label={t("ariaLabel")}>
        {tickets.map((ticket) => (
          <TicketListItem
            key={ticket.id}
            {...ticket}
            onOpen={onItemOpen}
            onEdit={onItemEdit}
            onToggleSelect={onItemToggleSelect}
          />
        ))}
      </ul>
    </section>
  );
};

export default TicketList;
