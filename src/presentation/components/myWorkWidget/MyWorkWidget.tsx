import React from "react";

import { Card, EmptyState } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./MyWorkWidget.module.scss";

type Ticket = {
  id: string;
  title: string;
  status?: string;
  projectId?: string;
};

type Props = {
  tickets: Ticket[];
  onTicketClick?: (ticketId: string, projectId?: string) => void;
  emptyMessage?: string;
  className?: string;
};

const MyWorkWidget = ({
  tickets,
  onTicketClick,
  emptyMessage,
  className,
}: Props) => {
  const t = useTranslation("pages.home.myWorkWidget");
  const widgetId = getAccessibilityId("my-work-widget");
  const displayEmptyMessage = emptyMessage || t("emptyMessage");

  const handleTicketClick = (
    ticketId: string,
    projectId?: string
  ): void => {
    if (onTicketClick) {
      onTicketClick(ticketId, projectId);
    }
  };

  const widgetClasses = [styles["my-work-widget"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      title={t("title")}
      className={widgetClasses}
      ariaLabel={t("title")}
    >
      {tickets.length === 0 ? (
        <EmptyState
          title={displayEmptyMessage}
          ariaLabel={displayEmptyMessage}
        />
      ) : (
        <ul
          id={widgetId}
          className={styles["my-work-widget__list"]}
          aria-label={t("title")}
        >
          {tickets.map((ticket) => {
            const ticketAriaLabel = `${ticket.title}${ticket.status ? `, ${t("statusLabel")}: ${ticket.status}` : ""}`;

            return (
              <li key={ticket.id} className={styles["my-work-widget__item"]}>
                {onTicketClick || ticket.projectId ? (
                  <button
                    type="button"
                    className={styles["my-work-widget__ticket"]}
                    onClick={() => {
                      handleTicketClick(ticket.id, ticket.projectId);
                    }}
                    aria-label={`${t("ticketAriaLabel")}: ${ticketAriaLabel}`}
                  >
                    <span className={styles["my-work-widget__ticket-title"]}>
                      {ticket.title}
                    </span>
                    {ticket.status && (
                      <span className={styles["my-work-widget__ticket-status"]}>
                        {ticket.status}
                      </span>
                    )}
                  </button>
                ) : (
                  <div className={styles["my-work-widget__ticket"]}>
                    <span className={styles["my-work-widget__ticket-title"]}>
                      {ticket.title}
                    </span>
                    {ticket.status && (
                      <span className={styles["my-work-widget__ticket-status"]}>
                        {ticket.status}
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default MyWorkWidget;