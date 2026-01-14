"use client";

import React from "react";

import { Button, Select, Text } from "@/presentation/components/ui";

import { useTranslation } from "@/shared/i18n";

import styles from "./TicketSort.module.scss";

export type SortField = "createdAt" | "title" | "status";
export type SortDirection = "asc" | "desc";

export type SortConfig = {
  field: SortField;
  direction: SortDirection;
};

type Props = {
  value: SortConfig;
  onChange: (next: SortConfig) => void;
  className?: string;
};

const TicketSort = ({ value, onChange, className }: Props) => {
  const t = useTranslation("pages.backlog.sort");

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const field = event.target.value as SortField;
    onChange({ ...value, field });
  };

  const handleDirectionToggle = (): void => {
    const nextDirection: SortDirection =
      value.direction === "asc" ? "desc" : "asc";
    onChange({ ...value, direction: nextDirection });
  };

  const containerClasses = [styles["ticket-sort"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div className={styles["ticket-sort__field"]}>
        <Select
          label={t("label")}
          value={value.field}
          onChange={handleFieldChange}
          options={[
            { value: "createdAt", label: t("fieldCreatedAt") },
            { value: "title", label: t("fieldTitle") },
            { value: "status", label: t("fieldStatus") },
          ]}
        />
      </div>
      <div className={styles["ticket-sort__direction"]}>
        <Text as="span" variant="caption">
          {value.direction === "asc" ? t("directionAsc") : t("directionDesc")}
        </Text>
        <Button
          label={
            value.direction === "asc" ? t("directionAsc") : t("directionDesc")
          }
          onClick={handleDirectionToggle}
          variant="secondary"
          aria-label={
            value.direction === "asc" ? t("directionAsc") : t("directionDesc")
          }
        />
      </div>
    </div>
  );
};

export default TicketSort;
