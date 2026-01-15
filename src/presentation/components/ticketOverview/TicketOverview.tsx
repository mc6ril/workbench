"use client";

import React, { useMemo } from "react";

import { Badge, Card, Stack, Text, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./TicketOverview.module.scss";

type Props = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  epicName?: string | null;
  assigneeName?: string | null;
  priority?: string | null;
  storyPoints?: number | null;
  className?: string;
};

const TicketOverview = ({
  id,
  title,
  description,
  status,
  epicName,
  assigneeName,
  priority,
  storyPoints,
  className,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.ticketOverview");

  const baseId = useMemo(() => getAccessibilityId(`ticket-${id}`), [id]);
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;
  const metaId = `${baseId}-meta`;

  const describedByIds = [description ? descriptionId : null, metaId]
    .filter(Boolean)
    .join(" ");

  const containerClasses = [styles["ticket-overview"], className]
    .filter(Boolean)
    .join(" ");

  const ariaLabelParts: string[] = [title];

  if (status) {
    ariaLabelParts.push(`${t("meta.status")}: ${status}`);
  }

  if (epicName) {
    ariaLabelParts.push(`${t("meta.epic")}: ${epicName}`);
  }

  if (assigneeName) {
    ariaLabelParts.push(`${t("meta.assignee")}: ${assigneeName}`);
  }

  if (priority) {
    ariaLabelParts.push(`${t("meta.priority")}: ${priority}`);
  }

  if (typeof storyPoints === "number") {
    ariaLabelParts.push(
      t("meta.storyPointsValue", {
        count: storyPoints,
      })
    );
  }

  const ariaLabel = `${t("ariaLabel")}: ${ariaLabelParts.join(", ")}`;

  return (
    <section
      className={containerClasses}
      aria-labelledby={titleId}
      aria-describedby={describedByIds || undefined}
      aria-label={ariaLabel}
    >
      <Card className={styles["ticket-overview__card"]}>
        <header className={styles["ticket-overview__header"]}>
          <Title
            id={titleId}
            variant="h2"
            className={styles["ticket-overview__title"]}
          >
            {title}
          </Title>
          <Stack
            as="div"
            direction="horizontal"
            spacing="xs"
            className={styles["ticket-overview__badges"]}
          >
            {status && (
              <Badge
                label={status}
                className={styles["ticket-overview__badge-status"]}
              />
            )}
            {priority && (
              <Badge
                label={priority}
                className={styles["ticket-overview__badge-priority"]}
              />
            )}
          </Stack>
        </header>

        <div id={metaId} className={styles["ticket-overview__meta"]}>
          <dl className={styles["ticket-overview__meta-list"]}>
            <div className={styles["ticket-overview__meta-row"]}>
              <dt className={styles["ticket-overview__meta-label"]}>
                {t("meta.status")}
              </dt>
              <dd className={styles["ticket-overview__meta-value"]}>
                {status || t("meta.notSet")}
              </dd>
            </div>

            <div className={styles["ticket-overview__meta-row"]}>
              <dt className={styles["ticket-overview__meta-label"]}>
                {t("meta.epic")}
              </dt>
              <dd className={styles["ticket-overview__meta-value"]}>
                {epicName || t("meta.notSet")}
              </dd>
            </div>

            <div className={styles["ticket-overview__meta-row"]}>
              <dt className={styles["ticket-overview__meta-label"]}>
                {t("meta.assignee")}
              </dt>
              <dd className={styles["ticket-overview__meta-value"]}>
                {assigneeName || t("meta.notSet")}
              </dd>
            </div>

            <div className={styles["ticket-overview__meta-row"]}>
              <dt className={styles["ticket-overview__meta-label"]}>
                {t("meta.priority")}
              </dt>
              <dd className={styles["ticket-overview__meta-value"]}>
                {priority || t("meta.notSet")}
              </dd>
            </div>

            <div className={styles["ticket-overview__meta-row"]}>
              <dt className={styles["ticket-overview__meta-label"]}>
                {t("meta.storyPoints")}
              </dt>
              <dd className={styles["ticket-overview__meta-value"]}>
                {typeof storyPoints === "number"
                  ? t("meta.storyPointsValue", { count: storyPoints })
                  : t("meta.notSet")}
              </dd>
            </div>
          </dl>
        </div>

        {description && (
          <Text
            id={descriptionId}
            as="p"
            variant="body"
            className={styles["ticket-overview__description"]}
          >
            {description}
          </Text>
        )}
      </Card>
    </section>
  );
};

export default React.memo(TicketOverview);

